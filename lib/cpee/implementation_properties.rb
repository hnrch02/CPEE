require_relative 'attributes_helper'
require 'json'

module CPEE
  module Properties

    def self::implementation(id,opts)
      Proc.new do
        run CPEE::Properties::Get, id, opts if get
        on resource 'state' do
          run CPEE::Properties::GetStateMachine, id, opts if get 'machine'
          run CPEE::Properties::GetState, id, opts if get
          run CPEE::Properties::PutState, id, opts if put 'state'
          on resource '@changed' do
            run CPEE::Properties::GetStateChanged, id, opts if get
          end
        end
        on resource 'status' do
          run CPEE::Properties::GetStatus, id, opts if get
          run CPEE::Properties::PutStatus, id, opts if put 'status' # !!! TODO
          on resource 'id' do
            run CPEE::Properties::GetStatusID, id, opts if get
          end
          on resource 'message' do
            run CPEE::Properties::GetStatusMessage, id, opts if get
          end
        end
        on resource 'handlerwrapper' do
          run CPEE::Properties::GetHandlerWrapper, id, opts if get
          run CPEE::Properties::PutHandlerWrapper, id, opts if put 'handlerwrapper'
        end
        %w{dataelements endpoints attributes}.each do |ele|
          on resource ele do
            run CPEE::Properties::GetItems, ele, id, opts if get
            run CPEE::Properties::PatchItems, ele, id, opts if patch ele
            run CPEE::Properties::PutItems, ele, id, opts if put ele
            run CPEE::Properties::PostItem, ele, id, opts if post ele[0..-2]
            on resource do
              run CPEE::Properties::GetItem, ele, id, opts if get
              run CPEE::Properties::SetItem, ele, id, opts if put 'string'
              run CPEE::Properties::DelItem, ele, id, opts if delete
            end
          end
        end
      end
    end

    class Get < Riddl::Implementation #{{{
      def response
        id = @a[0]
        opts = @a[1]
        doc = XML::Smart::open_unprotected(opts[:properties_empty])
        doc.register_namespace 'p', 'http://cpee.org/ns/properties/2.0'
        doc.find('/p:properties/p:state').first.text = CPEE::Properties::extract_item(id,opts,'state')
        doc.find('/p:properties/p:state/@changed').first.value = CPEE::Properties::extract_item(id,opts,'state/@changed')
        doc.find('/p:properties/p:status/p:id').first.text = CPEE::Properties::extract_item(id,opts,'status/id')
        doc.find('/p:properties/p:status/p:message').first.text = CPEE::Properties::extract_item(id,opts,'status/message')
        %w{dataelements endpoints attributes}.each do |item|
          des = doc.find("/p:properties/p:#{item}").first
          CPEE::Properties::extract_list(id,opts,item).each{ |de| des.add(*de) }
        end
        Riddl::Parameter::Complex.new('properties','application/xml',doc.to_s)
      end
    end #}}}
    class GetState < Riddl::Implementation #{{{
      def response
        id = @a[0]
        opts = @a[1]
        Riddl::Parameter::Simple.new('value',CPEE::Properties::extract_item(id,opts,'state'))
      end
    end #}}}
    class PutState < Riddl::Implementation #{{{
      def response
        id = @a[0]
        opts = @a[1]
        # TODO enforce correct state changes
        CPEE::Properties::set_item(id,opts,'state',@p[0].value)
        nil
      end
    end #}}}
    class GetStateMachine < Riddl::Implementation #{{{
      def response
        id = @a[0]
        opts = @a[1]
        Riddl::Parameter::Complex.new('statemachine','text/plain',<<~EOT)
          ready->ready
          ready->running
          ready->simulating
          ready->replaying
          ready->abandoned
          running->stopping->stopped
          running->finishing->finished
          simulating->ready
          simulating->stopped
          replaying->finishing->finished
          replaying->stopped
          stopped->abandoned
          stopped->running
          stopped->replaying
          stopped->simulating
        EOT
      end
    end #}}}
    class GetStateChanged < Riddl::Implementation #{{{
      def response
        id = @a[0]
        opts = @a[1]
        Riddl::Parameter::Simple.new('state',CPEE::Properties::extract_item(id,opts,'state/@changed'))
      end
    end #}}}
    class GetStatus < Riddl::Implementation #{{{
      def response
        id = @a[0]
        opts = @a[1]
        doc = XML::Smart::open_unprotected(opts[:properties_empty])
        doc.register_namespace 'p', 'http://cpee.org/ns/properties/2.0'
        doc.find('/p:properties/p:status/p:id').first.text = CPEE::Properties::extract_item(id,opts,'status/id')
        doc.find('/p:properties/p:status/p:message').first.text = CPEE::Properties::extract_item(id,opts,'status/message')
        Riddl::Parameter::Complex.new('status','text/xml',des.to_doc.to_s)
      end
    end #}}}
    class GetStatusID < Riddl::Implementation #{{{
      def response
        id = @a[0]
        opts = @a[1]
        Riddl::Parameter::Simple.new('value',CPEE::Properties::extract_item(id,opts,'status/id'))
      end
    end #}}}
    class GetStatusMessage < Riddl::Implementation #{{{
      def response
        id = @a[0]
        opts = @a[1]
        Riddl::Parameter::Simple.new('value',CPEE::Properties::extract_item(id,opts,'status/message'))
      end
    end #}}}
    class GetHandlerWrapper < Riddl::Implementation #{{{
      def response
        id = @a[0]
        opts = @a[1]
        Riddl::Parameter::Simple.new('value',CPEE::Properties::extract_item(id,opts,'handlerwrapper'))
      end
    end #}}}
    class PutHandlerWrapper < Riddl::Implementation #{{{
      def response
        id = @a[0]
        opts = @a[1]
        CPEE::Properties::set_item(id,opts,'handlerwrapper',@p[0].value)
        nil
      end
    end #}}}
    class GetItems < Riddl::Implementation #{{{
      def response
        item = @a[0]
        id = @a[1]
        opts = @a[2]
        doc = XML::Smart::open_unprotected(opts[:properties_empty])
        doc.register_namespace 'p', 'http://cpee.org/ns/properties/2.0'
        des = doc.find("/p:properties/p:#{item}").first
        CPEE::Properties::extract_list(id,opts,item).each{ |de| des.add(*de) }
        Riddl::Parameter::Complex.new(item,'text/xml',des.to_doc.to_s)
      end
    end #}}}
    class GetItem < Riddl::Implementation #{{{
      def response
        item = @a[0]
        id = @a[1]
        opts = @a[2]
        if val = CPEE::Properties::extract_item(id,opts,@r.join('/'))
          Riddl::Parameter::Simple.new('value',val)
        else
          @status = 404
        end
      end
    end #}}}
    class DelItem < Riddl::Implementation #{{{
      def response
        item = @a[0]
        id = @a[1]
        opts = @a[2]
        val = { @r.last => nil }
        if CPEE::Properties::extract_item(id,opts,@r.join('/'))
          CPEE::Properties::set_list(id,opts,item,val,val.keys)
        else
          @status = 404
        end
        nil
      end
    end #}}}
    class SetItem < Riddl::Implementation #{{{
      def response
        item = @a[0]
        id = @a[1]
        opts = @a[2]
        val = { @r.last => @p[0].value }
        if CPEE::Properties::extract_item(id,opts,@r.join('/'))
          CPEE::Properties::set_list(id,opts,item,val)
        else
          @status = 404
        end
        nil
      end
    end #}}}
    class PatchItems < Riddl::Implementation #{{{
      def response
        item = @a[0]
        id = @a[1]
        opts = @a[2]
        begin
          doc = XML::Smart::string(@p[0].value.read)
          val = doc.find("/*/*").map do |ele|
            [ele.qname.name, ele.text]
          end.to_h
          CPEE::Properties::set_list(id,opts,item,val)
          nil
        rescue
          @status = 400
        end
      end
    end #}}}
    class PutItems < Riddl::Implementation #{{{
      def response
        item = @a[0]
        id = @a[1]
        opts = @a[2]
        begin
          doc = XML::Smart::string(@p[0].value.read)
          val = doc.find("/*/*").map do |ele|
            [ele.qname.name, ele.text]
          end.to_h
          oldkeys = CPEE::Properties::extract_list(id,opts,item).to_h.keys
          newkeys = val.keys
          del = oldkeys - newkeys
          CPEE::Properties::set_list(id,opts,item,val,del)
          nil
        rescue
          @status = 400
        end
      end
    end #}}}
    class PostItem < Riddl::Implementation #{{{
      def response
        item = @a[0]
        id = @a[1]
        opts = @a[2]
        begin
          doc = XML::Smart::string(@p[0].value.read)
          val = doc.find("/*").map do |ele|
            [ele.qname.name, ele.text]
          end.to_h
          if not CPEE::Properties::extract_item(id,opts,File.join(@r.first,val.keys.first))
            CPEE::Properties::set_list(id,opts,item,val)
            Riddl::Parameter::Simple.new('id',val.keys.first)
          else
            @status= 409
          end
        rescue => e
          @status = 400
        end
      end
    end #}}}

    def self::set_list(id,opts,item,values,deleted=[])
      ah = AttributesHelper.new
      attributes = CPEE::Properties::extract_list(id,opts,'attributes').to_h
      dataelements = CPEE::Properties::extract_list(id,opts,'dataelements').to_h
      endpoints = CPEE::Properties::extract_list(id,opts,'endpoints').to_h
      CPEE::Notification::send_event(
        opts[:redis],
        File.join(item,'change'),
        id,
        {
          :instance_name => CPEE::Properties::extract_item(id,opts,'attributes/info'),
          :instance => id,
          :instance_uuid => CPEE::Properties::extract_item(id,opts,'attributes/uuid'),
          :changed => values.keys,
          :deleted => deleted,
          :values => values,
          :attributes => ah.translate(attributes,dataelements,endpoints),
          :timestamp => Time.now.xmlschema(3)
        }
      )
    end
    def self::set_item(id,opts,item,value)
      CPEE::Notification::send_event(
        opts[:redis],
        File.join(item,'change'),
        id,
        {
          :instance_name => CPEE::Properties::extract_item(id,opts,'attributes/info'),
          :instance => id,
          :instance_uuid => CPEE::Properties::extract_item(id,opts,'attributes/uuid'),
          item.to_sym => value,
          :timestamp => Time.now.xmlschema(3)
        }
      )
    end


    def self::extract_item(id,opts,item)
      opts[:redis].get("instance:#{id}/#{item}")
    end
    def self::extract_list(id,opts,item)
      opts[:redis].keys("instance:#{id}/#{item}/*").map do |e|
        [File.basename(e),opts[:redis].get(e)]
      end
    end
  end
end
