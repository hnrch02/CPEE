require 'Wee'
require 'WebHandlerFactory'

class WebWorkflow < Wee
  include WebHandlerFactory
  
  search true => SearchPos.new(:a1, :at)
  endpoint :endpoint1 => 'http://www.heise.de'
  endpoint :endpoint2 => 'http://www.orf.at'
  endpoint :endpoint3 => 'http://www.google.com'
  context :x => 'begin_', :y => "y", :z => "z"
  endstate :normal

  control flow do
    activity :a1, :call, endpoint1
    activity :a2, :call, endpoint1 do |result|
      @x += result;
    end
    activity :a3, :call, endpoint1, @x
  end
end
