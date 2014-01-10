require File.expand_path(File.dirname(__FILE__) + '/structures')
require File.expand_path(File.dirname(__FILE__) + '/cpee')
require 'rubygems'
require 'xml/smart'

module ProcessTransformation

  module Source

    class BPMN2
      attr_reader :dataelements, :endpoints

      class StructureMapping #{{{
        def self.new(node)
          case node.type
            when :exclusiveGateway
            when :inclusiveGateway
              Conditional.new(node.id,:inclusive)
          end
        end
      end #}}}

      def initialize(xml) #{{{
        @graph = Graph.new
        @tree = []
        start = nil

        doc = XML::Smart.string(xml)
        doc.register_namespace 'bm',  "http://www.omg.org/spec/BPMN/20100524/MODEL" 

        @dataelements = {}
        doc.find("/bm:definitions/bm:process/bm:property[bm:dataState/@name='cpee:dataelement']").each do |ref|
          if ref.attributes['itemSubjectRef']
            doc.find("/bm:definitions/bm:itemDefinition[@id=\"" + ref.attributes['itemSubjectRef'] + "\"]").each do |sref|
              @dataelements[ref.attributes['name']] = sref.attributes['structureRef'].to_s
            end 
          else
            @dataelements[ref.attributes['name']] = ''
          end  
        end

        @endpoints = {}
        doc.find("/bm:definitions/bm:process/bm:property[bm:dataState/@name='cpee:endpoint']/@itemSubjectRef").each do |ref|
          doc.find("/bm:definitions/bm:itemDefinition[@id=\"" + ref.value + "\"]/@structureRef").each do |sref|
            @endpoints[ref.value] = sref.value
          end  
        end

        # assign all important nodes to nodes
        doc.find("/bm:definitions/bm:process/bm:*[@id and @name]").each do |e|
          n = Node.new(e.attributes['id'],e.qname.name.to_sym,e.attributes['name'].strip,e.find('count(bm:incoming)'),e.find('count(bm:outgoing)'))

          e.find("bm:property[@name='cpee:endpoint']/@itemSubjectRef").each do |ep|
            n.endpoints << ep
          end
          e.find("bm:property[@name='cpee:method']/@itemSubjectRef").each do |m|
            n.methods << m
          end
          e.find("bm:script").each do |s|
            n.script << s.text.strip
          end
          e.find("bm:ioSpecification/bm:dataInput").each do |a|
            name = a.attributes['name']
            value = a.attributes['itemSubjectRef']
            if @dataelements.keys.include?(value)
              n.parameters[name] = 'data.' + value
            else  
              n.parameters[name] = value
            end
          end

          @graph.add_node n
          start = n if n.type == :startEvent && start == nil
        end

        # extract all sequences to a links
        doc.find("/bm:definitions/bm:process/bm:sequenceFlow").each do |e|
          source = e.attributes['sourceRef']
          target = e.attributes['targetRef']
          cond = e.find('bm:conditionExpression')
          @graph.add_flow Link.new(source, target, cond.empty? ? nil : cond.first.text.strip)
        end

        build_tree @tree, start
      end #}}}

      def build_tree(branch,node,because_of=[])
        while node
          case node.type
            when :parallelGateway
              return node if node.incoming > 1 
              if node.incoming == 1 && node.outgoing > 1
                branch << (x = Parallel.new(node.id))
                ncollect = @graph.next_nodes(node).map do |n|
                  build_tree(x.new_branch,n)
                end.flatten
                if ncollect.uniq.length == 1
                  ### e.g. multiple nested parallels share one parallel end node, i.e. not wellformed (see test/base4.xml)
                  if ncollect.length < ncollect.first.incoming 
                    return ncollect
                  ### a wellformed (start and end) structure   
                  else
                    node = ncollect.first
                  end  
                else  
                  ### shit hits the fan, some syntax error in modelling
                  raise "#{x.pretty_inspect}-----> no common end node"
                end  
              end
            when :exclusiveGateway
              # check if a branch is part of a loop -> branch and condition is a loop (also works for multiple)
              # if more than one branch reaches end its an exclusive
              # if one branch reaches the end continue as normal
              return node if node.incoming > 1 
              if node.incoming == 1 && node.outgoing > 1
                branch << (x = Conditional.new(node.id,:exclusive))
                ncollect = @graph.next_nodes(node).map do |n|
                  cond = @graph.incoming_condition(n).first.condition
                  build_tree(x.new_branch(cond),n)
                end.flatten
                if ncollect.uniq.length == 1
                  ### e.g. multiple nested parallels share one parallel end node, i.e. not wellformed (see test/base4.xml)
                  if ncollect.length < ncollect.first.incoming 
                    return ncollect
                  ### a wellformed (start and end) structure   
                  else
                    node = ncollect.first
                  end  
                else  
                  ### shit hits the fan, some syntax error in modelling
                  raise "#{x.pretty_inspect}-----> no common end node"
                end  
              end
            when :task, :callActivity, :serviceTask
              branch << node
            when :endEvent
              node = nil
            when :scriptTask
              puts 'nooooow'
            when :startEvent
            else
              raise "#{node.type} not supported yet"
          end

          node = @graph.next_node(node) if node
        end

      end
      private :build_tree

      def model(formater) #{{{
        formater.new(@tree).generate
      end #}}}

    end  

  end

end  
