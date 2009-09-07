require 'lib/MarkUS_V3.0'

class ContextGET < Riddl::Implementation
  include MarkUSModule

  def response
    pp "ContextGET, r0=#{@r[0]}"
    instance_id = @r[0].to_i
    wf = $controller[instance_id]
    Riddl::Parameter::Complex.new("cvs","text/html") do
      div_ do
        wf.context.each do |id, value|
          a_ id, :href => id, :style => "display:block"
        end
      end
    end
  end
end
class ContextPOST < Riddl::Implementation
  include MarkUSModule

  def response
    pp "ContextPOST, r0=#{@r[0]}, p0=#{@p[0].value}, p1=#{@p[1].value}"
    instance_id = @r[0].to_i
    wf = $controller[instance_id]
    wf.context @p[0].value => @p[1].value
    # Riddl::Parameter::Simple.new("context-id", )
  end
end