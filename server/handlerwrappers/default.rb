# This file is part of CPEE.
#
# CPEE is free software: you can redistribute it and/or modify it under the terms
# of the GNU General Public License as published by the Free Software Foundation,
# either version 3 of the License, or (at your option) any later version.
#
# CPEE is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE.  See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along with
# CPEE (file COPYING in the main directory).  If not, see
# <http://www.gnu.org/licenses/>.

class DefaultHandlerWrapper < WEEL::HandlerWrapperBase
  def self::inform_state_change(arguments,newstate) # {{{
    controller = arguments[0]
		controller.serialize_state!
		controller.notify("state/change", :instance => controller.instance, :state => newstate)
  end # }}}
  def self::inform_syntax_error(arguments,err,code)# {{{
    controller = arguments[0]
    controller.notify("description/error", :instance => controller.instance, :message => err.message)
  end# }}}
  def self::inform_handlerwrapper_error(arguments,err) # {{{
    controller = arguments[0]
    controller.notify("handlerwrapper/error", :instance => controller.instance, :message => err.message)
  end # }}}
  def self::inform_position_change(arguments,ipc={}) # {{{
    controller = arguments[0]
    controller.serialize_positions!
    ipc[:instance] = controller.instance
    controller.notify("position/change", ipc)
  end # }}}

  def initialize(arguments,endpoint=nil,position=nil,continue=nil) # {{{
    @controller = arguments[0]
    @handler_continue = continue
    @handler_endpoint = endpoint
    @handler_position = position
    @handler_passthrough = nil
    @handler_returnValue = nil
  end # }}}

  def activity_handle(passthrough, parameters) # {{{
    @controller.notify("activity/calling", :instance => @controller.instance, :instance_uuid => @controller.uuid, :activity => @handler_position, :passthrough => passthrough, :endpoint => @handler_endpoint, :parameters => parameters, :time=>Time.now.strftime("%Y-%m-%dT%H:%M:%S.%L%:z"))
    if passthrough.nil?
      params = []
      callback = Digest::MD5.hexdigest(Kernel::rand().to_s)
      (parameters[:arguments] || []).each do |s|
        if s.respond_to?(:mimetype)
          params <<  Riddl::Parameter::Complex.new(s.name.to_s,v.mimetype,v.value)
        else
          params <<  Riddl::Parameter::Simple.new(s.name.to_s,CPEE::ValueHelper::generate(s.value))
        end
      end

      params << Riddl::Header.new("CPEE-BASE",@controller.base_url)
      params << Riddl::Header.new("CPEE-INSTANCE",@controller.instance_url)
      params << Riddl::Header.new("CPEE-CALLBACK",@controller.instance_url + '/callbacks/' + callback)
      params << Riddl::Header.new("CPEE-CALLBACK_ID",callback)
      params << Riddl::Header.new("CPEE-ACTIVITY",@handler_position)
      params << Riddl::Header.new("CPEE-LABEL",parameters[:label]||'')
      @controller.attributes.each do |key,value|
        params << Riddl::Header.new("CPEE-ATTR-#{key.gsub(/_/,'-')}",value)
      end

      type = parameters[:method] || 'post'
      client = Riddl::Client.new(@handler_endpoint)

      status, result, headers = client.request type => params
      raise "Could not #{parameters[:method] || 'post'} #{@handler_endpoint}" if status < 200 || status >= 300

      if headers["CPEE_CALLBACK"] && headers["CPEE_CALLBACK"] == 'true'
        @controller.callbacks[callback] = CPEE::Callback.new("callback activity: #{@handler_position}",self,:callback,nil,nil,:http)
        @handler_passthrough = callback
      else
        callback result
      end
    else
      @controller.callbacks[passthrough] = CPEE::Callback.new("callback activity: #{@handler_position}",self,:callback,nil,nil,:http)
      @handler_passthrough = passthrough
    end
  end # }}}

  def activity_result_status # {{{
    WEEL::Status.new(1, "everything okay")
  end # }}}

  def activity_result_value # {{{
    @handler_returnValue
  end # }}}

  def activity_stop # {{{
    unless @handler_passthrough.nil?
      @controller.callbacks.delete(@handler_passthrough)
    end
  end # }}}
  def activity_passthrough_value # {{{
    @handler_passthrough
  end # }}}

  def activity_no_longer_necessary # {{{
    true
  end # }}}

  def inform_activity_done # {{{
    @controller.notify("activity/done", :endpoint => @handler_endpoint, :instance => @controller.instance, :instance_uuid => @controller.uuid, :activity => @handler_position, :time=>Time.now.strftime("%Y-%m-%dT%H:%M:%S.%L%:z"))
  end # }}}
  def inform_activity_manipulate # {{{
    @controller.notify("activity/manipulating", :endpoint => @handler_endpoint, :instance => @controller.instance, :instance_uuid => @controller.uuid, :activity => @handler_position, :time=>Time.now.strftime("%Y-%m-%dT%H:%M:%S.%L%:z"))
  end # }}}
  def inform_activity_failed(err) # {{{
    puts err.message
    puts err.backtrace
    @controller.notify("activity/failed", :endpoint => @handler_endpoint, :instance => @controller.instance, :instance_uuid => @controller.uuid, :activity => @handler_position, :message => err.message, :line => err.backtrace[0].match(/(.*?):(\d+):/)[2], :where => err.backtrace[0].match(/(.*?):(\d+):/)[1], :time=>Time.now.strftime("%Y-%m-%dT%H:%M:%S.%L%:z"))
  end # }}}
  def inform_manipulate_change(status,changed_dataelements,changed_endpoints,dataelements,endpoints) # {{{
    unless status.nil?
      @controller.serialize_status!
      @controller.notify("status/change", :endpoint => @handler_endpoint, :instance => @controller.instance, :instance_uuid => @controller.uuid, :activity => @handler_position, :id => status.id, :message => status.message)
    end
    unless changed_dataelements.nil?
      @controller.serialize_dataelements!
      @controller.notify("dataelements/change", :endpoint => @handler_endpoint, :instance => @controller.instance, :instance_uuid => @controller.uuid, :activity => @handler_position, :changed => changed_dataelements)
    end
    unless changed_endpoints.nil?
      @controller.serialize_endpoints!
      @controller.notify("endpoints/change", :endpoint => @handler_endpoint, :instance => @controller.instance, :instance_uuid => @controller.uuid, :activity => @handler_position, :changed => changed_endpoints)
    end
  end # }}}

  def vote_sync_after # {{{
    @controller.call_vote("activity/syncing_after", :endpoint => @handler_endpoint, :instance => @controller.instance, :instance_uuid => @controller.uuid, :activity => @handler_position, :time=>Time.now.strftime("%Y-%m-%dT%H:%M:%S.%L%:z"))
  end # }}}
  def vote_sync_before(parameters=nil) # {{{
    @controller.call_vote("activity/syncing_before", :endpoint => @handler_endpoint, :instance => @controller.instance, :instance_uuid => @controller.uuid, :activity => @handler_position, :parameters => parameters, :time=>Time.now.strftime("%Y-%m-%dT%H:%M:%S.%L%:z"))
  end # }}}

  def simplify_result(result)
    if result.length == 1
      if result[0].is_a? Riddl::Parameter::Simple
        result = result[0].value
      elsif result[0].is_a? Riddl::Parameter::Complex
        if result[0].mimetype == 'application/json'
          result = JSON::parse(result[0].value.read) rescue nil
        elsif result[0].mimetype == 'application/xml' || result[0].mimetype == 'text/xml'
          result = XML::Smart::string(result[0].value.read) rescue nil
        elsif result[0].mimetype == 'text/plain'
          result = result[0].value.read
          result = result.to_f if result == result.to_f.to_s
          result = result.to_i if result == result.to_i.to_s
        elsif result[0].mimetype == 'text/html'
          result = result[0].value.read
          result = result.to_f if result == result.to_f.to_s
          result = result.to_i if result == result.to_i.to_s
        else
          result = result[0]
        end
      end
    end
    result
  end

  def structurize_result(result)
    result.map do |r|
      if r.is_a? Riddl::Parameter::Simple
        { r.name => r.value }
      elsif r.is_a? Riddl::Parameter::Complex
        tmp = {
          r.name == '' ? 'result' : r.name => {
            'mimetype' => r.mimetype,
            'content' => r.value.read
          }
        }
        r.value.rewind
        tmp
      end
    end
  end

  def callback(result=nil,options={})
    @controller.notify("activity/receiving", :instance => @controller.instance, :instance_uuid => @controller.uuid, :activity => @handler_position, :endpoint => @handler_endpoint, :received => structurize_result(result), :time=>Time.now.strftime("%Y-%m-%dT%H:%M:%S.%L%:z"))
    result = simplify_result(result)
    if options['CPEE_UPDATE']
      @handler_returnValue = result
      if options['CPEE_UPDATE_STATUS']
        @controller.notify("activity/status", :instance => @controller.instance, :instance_uuid => @controller.uuid, :activity => @handler_position, :endpoint => @handler_endpoint, :status => options['CPEE_UPDATE_STATUS'], :time=>Time.now.strftime("%Y-%m-%dT%H:%M:%S.%L%:z"))
      end
      @handler_continue.continue WEEL::Signal::Again
    else
      @controller.callbacks.delete(@handler_passthrough)
      @handler_returnValue = result
      @handler_passthrough = nil
      @handler_continue.continue
    end
  end

  def simulate(type,nesting,tid,parent,parameters={}) #{{{
    pp "#{type} - #{nesting} - #{tid} - #{parent} - #{parameters.inspect}"

    @controller.call_vote("simulating/step",
      :endpoint => @handler_endpoint,
      :instance => @controller.instance,
      :instance_uuid => @controller.uuid,
      :activity => tid,
      :type => type,
      :nesting => nesting,
      :parent => parent,
      :parameters => parameters
    )
  end #}}}
end
