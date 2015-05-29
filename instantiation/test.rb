#!/usr/bin/ruby
require 'rubygems'
require 'riddl/server'
require 'xml/smart'

$inst = 'http://localhost:9296/'

srv = Riddl::Client.new($inst, $inst + "?riddl-description")
status, res = srv.post Riddl::Parameter::Complex.new('xml','text/xml',File.read(File.dirname(__FILE__) + '/testset.xml'))

puts status
p res
