#!/usr/bin/ruby
#
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

require 'json'
require 'redis'
require 'riddl/client'
require 'daemonite'
require 'pp'

EVENTS = %w{
  event:state/change
  event:handlerwrapper/change
  event:description/change
  event:dataelements/change
  event:endpoints/change
  event:attributes/change
  event:transformation/change
  event:status/change
  event:position/change
  event:handler/change
}

Daemonite.new do |opts|
  redis = Redis.new(path: "/tmp/redis.sock", db: 3)
  pubsubredis = Redis.new(path: "/tmp/redis.sock", db: 3)

  run do
    pubsubredis.psubscribe(EVENTS) do |on|
      on.pmessage do |pat, what, message|
        mess = JSON.parse(message)
        case what
          when 'event:state/change'
            redis.multi do |multi|
              multi.set("instance:#{mess.dig('instance')}/state",mess.dig('content','state'))
              multi.set("instance:#{mess.dig('instance')}/state/@changed",mess.dig('content','timestamp'))
            end
          when 'event:handlerwrapper/change'
            redis.set("instance:#{mess.dig('instance')}/handlerwrapper",mess.dig('content','handlerwrapper'))
          when 'event:description/change'
            redis.multi do |multi|
              multi.set("instance:#{mess.dig('instance')}/description",mess.dig('content','description'))
              multi.set("instance:#{mess.dig('instance')}/dslx",mess.dig('content','dslx'))
              multi.set("instance:#{mess.dig('instance')}/dsl",mess.dig('content','dsl'))
            end
          when 'event:dataelements/change', 'event:endpoints/change', 'event:attributes/change'
            redis.multi do |multi|
              mess.dig('content','changed').each do |c|
                unless what == 'event:attributes/change' && c == 'uuid'
                  multi.sadd("instance:#{mess.dig('instance')}/#{mess.dig('topic')}",c)
                  multi.set("instance:#{mess.dig('instance')}/#{mess.dig('topic')}/#{c}",mess.dig('content','values',c))
                end
              end
              mess.dig('content','deleted').to_a.each do |c|
                unless what == 'event:attributes/change' && c == 'uuid'
                  multi.srem("instance:#{mess.dig('instance')}/#{mess.dig('topic')}",c)
                  multi.del("instance:#{mess.dig('instance')}/#{mess.dig('topic')}/#{c}")
                end
              end
            end
          when 'event:transformation/change'
            redis.multi do |multi|
              multi.set("instance:#{mess.dig('instance')}/transformation/description/",mess.dig('content','description'))
              multi.set("instance:#{mess.dig('instance')}/transformation/description/@type",mess.dig('content','description_type'))
              multi.set("instance:#{mess.dig('instance')}/transformation/dataelements/",mess.dig('content','dataelements'))
              multi.set("instance:#{mess.dig('instance')}/transformation/dataelements/@type",mess.dig('content','dataelements_type'))
              multi.set("instance:#{mess.dig('instance')}/transformation/endpoints/",mess.dig('content','endpoints'))
              multi.set("instance:#{mess.dig('instance')}/transformation/endpoints/@type",mess.dig('content','endpoints_type'))
            end
          when 'event:status/change'
            redis.multi do |multi|
              multi.set("instance:#{mess.dig('instance')}/status/id",mess.dig('content','id'))
              multi.set("instance:#{mess.dig('instance')}/status/message",mess.dig('content','message'))
            end
          when 'event:position/change'
            redis.multi do |multi|
              c = mess.dig('content')
              c.dig('at')&.each do |ele|
                multi.sadd("instance:#{mess.dig('instance')}/positions",ele['position'])
                multi.set("instance:#{mess.dig('instance')}/positions/#{ele['position']}",'at')
                multi.set("instance:#{mess.dig('instance')}/positions/#{ele['position']}/@passthrough",ele['passthrough']) if ele['passthrough']
              end
              c.dig('before')&.each do |ele|
                multi.sadd("instance:#{mess.dig('instance')}/positions",ele['position'])
                multi.set("instance:#{mess.dig('instance')}/positions/#{ele['position']}",'before')
              end
              c.dig('after')&.each do |ele|
                multi.sadd("instance:#{mess.dig('instance')}/positions",ele['position'])
                multi.set("instance:#{mess.dig('instance')}/positions/#{ele['position']}",'after')
              end
              c.dig('unmark')&.each do |ele|
                multi.srem("instance:#{mess.dig('instance')}/positions",ele['position'])
                multi.del("instance:#{mess.dig('instance')}/positions/#{ele['position']}")
              end
            end
          when 'event:handler/change'
            redis.multi do |multi|
              mess.dig('content','changed').each do |c|
                multi.sadd("instance:#{mess.dig('instance')}/#{mess.dig('topic')}",mess.dig('content','key'))
                multi.sadd("instance:#{mess.dig('instance')}/#{mess.dig('topic')}/#{mess.dig('content','key')}",c)
                multi.set("instance:#{mess.dig('instance')}/#{mess.dig('topic')}/#{mess.dig('content','key')}/url",mess.dig('content','url'))
                multi.sadd("instance:#{mess.dig('instance')}/#{mess.dig('topic')}/#{c}",mess.dig('content','key'))
              end
              mess.dig('content','deleted').to_a.each do |c|
                multi.srem("instance:#{mess.dig('instance')}/#{mess.dig('topic')}/#{mess.dig('content','key')}",c)
                multi.srem("instance:#{mess.dig('instance')}/#{mess.dig('topic')}/#{c}",mess.dig('content','key'))
              end
            end
            if redis.scard("instance:#{mess.dig('instance')}/#{mess.dig('topic')}/#{mess.dig('content','key')}") < 1
              redis.multi do |multi|
                multi.del("instance:#{mess.dig('instance')}/#{mess.dig('topic')}/#{mess.dig('content','key')}/url")
                multi.srem("instance:#{mess.dig('instance')}/#{mess.dig('topic')}",mess.dig('content','key'))
              end
            end
        end
      rescue => e
        puts e.message
        puts e.backtrace
      end
    end
  end
end.go!
