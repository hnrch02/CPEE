function create_header(value){ //{{{
  var tmp = $("#prop_template_header tr").clone();
  $('.header_value',tmp).text(value);
  return tmp;
} //}}}
function create_sizer(){ //{{{
  var tmp = $("#prop_template_sizer tr").clone();
  return tmp;
} //}}}
function create_line(main,text){ //{{{
  var tmp = $("#prop_template_line tr").clone();
  $('.line_main',tmp).text(main);
  $('.line_text',tmp).text(text);
  return tmp;
} //}}}
function create_element(content,svgid){ //{{{
  var tmp = $("#prop_template_readonly tr").clone();
  $('.prop_name',tmp).text('Element');
  $('.prop_value',tmp).val(content);
  $('.prop_value',tmp).addClass('pname_element');
  $('.prop_value',tmp).parent().append($("<input type='hidden' class='pname_svgid' value='" + svgid + "'>"));
  return tmp;
} //}}}
function create_readonly_property(name,content){ //{{{
  var tmp = $("#prop_template_readonly tr").clone();
  $('.prop_name',tmp).text(name);
  $('.prop_value',tmp).val(content);
  $('.prop_value',tmp).addClass('pname_' + name.toLowerCase());
  return tmp;
} //}}}
function create_input_property(name,cls,content){ //{{{
  var tmp = $("#prop_template_input tr").clone();
  tmp.addClass(cls);
  $('.prop_name',tmp).text(name);
  $('.prop_value',tmp).val(content);
  $('.prop_value',tmp).addClass('pname_' + name.toLowerCase());
  return tmp;
} //}}}
function create_select_property(name,cls,content,alts){ //{{{
  var tmp = $("#prop_template_select tr").clone();
  tmp.addClass(cls);
  $('.prop_name',tmp).text(name);
  $('.prop_value',tmp).addClass('pname_' + name.toLowerCase());
  $.each(alts,function(a,b){
    var o = $('<option value="' + b + '">' + b + '</option>');
    if (b == content) o.attr('selected','selected');
    $('.prop_value',tmp).append(o);
  });  
  return tmp;
} //}}}
function create_area_property(name,cls,content){ //{{{
  var tmp = $("#prop_template_area tr").clone();
  tmp.addClass(cls);
  $('.prop_name',tmp).text(name);
  $('.prop_value',tmp).addClass('pname_' + name.toLowerCase());
  $('.prop_value',tmp).text(content);
  return tmp;
} //}}}
function create_input_pair(name,cls,content){ //{{{
  var tmp = $("#dat_template_pair tr").clone();
  tmp.addClass(cls);
  $('.pair_name',tmp).val(name);
  $('.pair_value',tmp).val(content);
  return tmp;
} //}}}

function CPEE(adaptor) {
  this.adaptor = adaptor;
  this.elements = elements = {};
  this.events = events = {};

  this.noarrow = noarrow = ['alternative', 'otherwise'];

  // Events
  this.events.mousedown = function(svgid, e, child, sibling) { // {{{
    if(e.button == 0) {  // left-click
    } else if(e.button == 1) { // middle-click
    } else if(e.button == 2) { // right-click
      var xml_node = adaptor.description.get_node_by_svg_id(svgid);
      var group = null;
      var menu = {};
  
      if(child) {
        group = elements[xml_node.get(0).tagName].permissible_children(xml_node);
        if(group.length > 0) menu['Insert into'] = group;
      }
      if(sibling) {
        group = elements[xml_node.parent().get(0).tagName].permissible_children(xml_node);
        if(group.length > 0) menu['Insert after'] = group;
      }
  
      if(xml_node.get(0).tagName != 'description' && !elements[xml_node.get(0).tagName].neverdelete)
        menu['Remove Element'] = [{'label': 'Actual Element', 
                        'function_call': adaptor.description.remove, 
                        'menu_icon': function() {
                          var icon =  elements[xml_node.get(0).tagName].illustrator.svg();
                          icon.children('.rfill').css({'fill':'red','fill-opacity':'0.5'});
                          return icon;
                        },
                        'params': [null, xml_node]}];
      if($('> manipulate', xml_node).length > 0 && xml_node.get(0).tagName == 'call') {
        menu['Remove Element'].push({'label': 'Remove Scripts', 
                        'function_call': adaptor.description.remove, 
                        'menu_icon': function() {
                          var icon =  elements.callmanipulate.illustrator.svg();
                          icon.children('.rfill:last').css({'fill':'red','fill-opacity':'0.5'});
                          return icon;
                        },
                        'params': ['> manipulate', xml_node]});
      }
      new CustomMenu(e).contextmenu(menu);
    }
    return false;
  } // }}} 
  this.events.click = function(svgid, e) { // {{{ 
    if (adaptor.description.get_node_by_svg_id(svgid).length == 0) {
      return;
    }

    if ($('#state').text() != 'finished')
      $('#main .tabbehind button').show();
    if ($('#main .tabbehind button').hasClass('highlight')) {
      var check = confirm("Discard changes?");
      if (check)
        $('#main .tabbehind button').removeClass('highlight');
      else  
        return;
    }  

    var visid = 'details';
    var tab   = $('#dat_' + visid);
    var node  = adaptor.description.get_node_by_svg_id(svgid).get(0);
  
    tab.empty();
    tab.append(create_element(node.nodeName,svgid));
    switch(node.nodeName) {
      case 'call':
        tab.append(create_readonly_property('ID',$(node).attr('id')));
        tab.append(create_input_property('Endpoint','',$(node).attr('endpoint')));
  
        if ($('finalize',node).length > 0)
          tab.append(create_area_property('Finalize','',format_text_skim($('finalize',node).text())));
        if ($('update',node).length > 0)
          tab.append(create_area_property('Update','',format_text_skim($('update',node).text())));
  
        tab.append(create_header('Parameters:'));
  
        tab.append(create_input_property('Label','indent',$('parameters label',node).text()));
        tab.append(create_input_property('Method','indent',$('parameters method',node).text()));
        $.each($('parameters parameters *',node),function(){
          tab.append(create_input_pair(this.nodeName,'indent',$(this).text()));
        });
        break;
      case 'manipulate':
        tab.append(create_readonly_property('ID',$(node).attr('id')));
        tab.append(create_area_property('Script','',format_text_skim($(node).text())));
        break;
      case 'loop':
        if ($(node).attr('pre_test') != undefined)
          var mode = 'pre_test';
        if ($(node).attr('post_test') != undefined)
          var mode = 'post_test';
        tab.append(create_select_property('Mode','',mode,['post_test','pre_test']));
        tab.append(create_input_property('Condition','',$(node).attr(mode)));
        break;
      case 'choose':
        var mode = ($(node).attr('mode') == 'inclusive' || $(node).attr('mode') == undefined ? 'inclusive' : 'exclusive')
        tab.append(create_select_property('Mode','',mode,['exclusive','inclusive']));
        break;
      case 'alternative':
        tab.append(create_input_property('Condition','',$(node).attr('condition')));
        break;
      case 'critical':
        var sid = ($(node).attr('sid') == '' ? 'section' : $(node).attr('sid'));
        tab.append(create_input_property('SID','',sid));
        tab.append(create_line('Hint','Identical SID\'s shared by between differnt "critical" elements define mutual exclusive areas'));
        break;
      case 'parallel':
        var wait = ($(node).attr('wait') == '' || $(node).attr('wait') == undefined ? '-1' : $(node).attr('wait'));
        tab.append(create_input_property('Wait','',wait));
        tab.append(create_line('Hint','-1 to wait for all branches'));
        break;
      case 'parallel_branch':
        tab.append(create_input_property('Pass to branch','',$(node).attr('pass')));
        tab.append(create_input_property('Local scope','',$(node).attr('local')));
        break;
      // TODO group
    }
    // add the sizer in order for colspan to work
    tab.append(create_sizer());
    save['details'] = serialize_details(tab).serializeXML();
  } // }}}
  this.events.dblclick = function(svgid, e) { // {{{
  } // }}}
  this.events.mouseover = function(svgid, e) { // {{{
    $('.tile[element-id = "' + svgid + '"]').css('display','block');
    return false;
  } // }}}
  this.events.mouseout = function(svgid, e) { // {{{
    $('.tile[element-id = "' + svgid + '"]').css('display','none');
    return false;
  } // }}}
  this.events.dragstart = function (svgid, e) { //{{{
  } //}}}

  // Abstract Elements (they only have an illustrator)
  this.elements.callmanipulate = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'abstract', 
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<rect x="1" y="1" width="28" height="28" rx="4" class="rfill stand"/>' +
                    '<path transform="scale(0.7) translate(12, 2)" class="stand" style="fill:#000000;" d="m 19.511059,31.248618 0,-23.6413153 -3.940219,0 0,15.7608793 -7.8804404,-7.88044 0,7.88044 -7.88043943,-7.88044 0,15.760876 z"/>' +
                    '<circle cx="28" cy="27" r="9" class="rfill stand"/>' + 
                    '<text transform="translate(28,31)" class="small">s</text>' +
                  '</svg>');
      }
    },//}}}
    'description': '<call id="###" endpoint="" xmlns="http://this.org/ns/description/1.0"><parameters><label>""</label><method>:post</method><parameters/></parameters><finalize output="result"/><update output="result"/></call>',
    'permissible_children': function(node) { //{{{
      if(node.children('finalize,update').lenght < 1)
        return [
         {'label': 'Scripts', 
          'function_call': adaptor.description.insert_last_into, 
          'menu_icon': elements.callmanipulate.illustrator.svg, 
          'params': [adaptor.description.elements.manipulate, node]}
        ];
      return [];
    }, //}}}
    'adaptor' : {//{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,true, true);
      },
      'click': events.click,
    }//}}}
  }; /*}}}*/
  this.elements.choose_inclusive = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'abstract',
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<rect transform="rotate(45,14,12)" x="7" y="3" width="21" height="21" class="stand"/>' +
                    '<circle cx="15.5" cy="15.5" r="7" class="stand"/>' + 
                  '</svg>');
      }
    },//}}}
  };  /*}}}*/
  this.elements.choose_exclusive = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'abstract',
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<rect transform="rotate(45,14,12)" x="7" y="3" width="21" height="21" class="stand"/>' +
                    '<line x1="10.5" y1="20.5" x2="20.5" y2="10.5" class="stand"/>' +
                    '<line x1="10.5" y1="10.5" x2="20.5" y2="20.5" class="stand"/>' +
                  '</svg>');
      }
    },//}}}
  };  /*}}}*/

  // Primitive Elements
  this.elements.call = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'primitive', 
      'endnodes' : 'this',
      'resolve_symbol' : function(node) { 
        if($(node).attr('endpoint') == 'instantiation') {
          return 'callinstantiation'; 
        } else if($(node).attr('endpoint') == 'correlation') {
          return 'callcorrelation'; 
        } else if($('parameters > service', node).length > 0) {
          return 'callinjection'; 
        } else if($('finalize,update', node).length > 0) {
          return 'callmanipulate'; 
        } else {
          return'call';
        }
      },
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<rect x="1" y="1" width="28" height="28" rx="4" class="rfill stand"/>' +
                    '<path transform="scale(0.7) translate(12, 2)" class="stand" style="fill:#000000;" d="m 19.511059,31.248618 0,-23.6413153 -3.940219,0 0,15.7608793 -7.8804404,-7.88044 0,7.88044 -7.88043943,-7.88044 0,15.760876 z"/>' +
                  '</svg>');
      }
    },//}}}
    'description': '<call id="###" endpoint="" xmlns="http://cpee.org/ns/description/1.0"><parameters xmlns="http://cpee.org/ns/description/1.0"><label>""</label><method>:post</method><parameters/></parameters></call>',
    'permissible_children': function(node) { //{{{
      if(node.children('finalize,update').length < 1) 
        return [
         {'label': 'Scripts', 
          'function_call': adaptor.description.insert_last_into, 
          'menu_icon': elements.callmanipulate.illustrator.svg, 
          'params': [adaptor.description.elements.scripts, node]}
        ];
      return [];
    }, //}}}
  'adaptor' : {//{{{
    'mousedown': function (node, e) {
      events.mousedown(node,e,true, true);
    },
    'click': events.click,
    'dragstart': events.dragstart,
   }//}}}
  }; /*}}}*/
  this.elements.scripts = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'primitive',
      'endnodes' : 'this',
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<rect x="1" y="1" width="28" height="28" rx="4" class="rfill stand"/>' +
                    '<text transform="translate(15,21)" class="normal">s</text>' +
                  '</svg>');
      }
    },//}}}
    'description': ['<finalize xmlns="http://cpee.org/ns/description/1.0"/>','<update xmlns="http://cpee.org/ns/description/1.0"/>'],
    'permissible_children': function(node) { //{{{
      return [];
    }, //}}}
    'adaptor': { //{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,false, true);
      },
      'click': events.click,
    } //}}}
  }; /*}}}*/
  this.elements.manipulate = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'primitive',
      'endnodes' : 'this',
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<rect x="1" y="1" width="28" height="28" rx="4" class="rfill stand"/>' +
                    '<text transform="translate(15,21)" class="normal">s</text>' +
                  '</svg>');
      }
    },//}}}
    'description': '<manipulate id="###" xmlns="http://cpee.org/ns/description/1.0"/>',
    'permissible_children': function(node) { //{{{
      return [];
    }, //}}}
  'adaptor' : {//{{{
    'mousedown': function (node, e) {
      events.mousedown(node,e,false, true);
    },
    'click': events.click,
   }//}}}
  }; /*}}}*/
  this.elements.escape = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'primitive',
      'endnodes' : 'this',
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<circle cx="15" cy="15" r="14" class="stand"/>' +
                    '<circle cx="15" cy="15" r="11" class="stand"/>' +
                    '<polygon points="10.5,20.5 15,8.5 20.5,20.5 15,15.5 10.5,20.5" class="black"/>' +
                  '</svg>');
      }
    },//}}}
    'description': '<escape xmlns="http://cpee.org/ns/description/1.0"/>',
    'permissible_children': function(node) { //{{{
      return [];
    }, //}}}
    'adaptor' : {//{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,false, true);
      },
      'click': events.click,
    }//}}}
  }; /*}}}*/
  
  // Complex Elements
  this.elements.choose = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'complex',
      'endnodes' : 'aggregate',
      'closeblock': false,
      'expansion' : function(node) { 
        return 'horizontal';
      }, 
      'resolve_symbol' : function(node) { 
        if($(node).attr('mode') == 'exclusive') {
          return 'choose_exclusive'; 
        } else {
          return 'choose_inclusive';
        }
      },
      'col_shift' : function(node) { 
        return false; 
      },
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<rect transform="rotate(45,14,12)" x="7" y="3" width="21" height="21" class="stand"/>' +
                    '<circle cx="15.5" cy="15.5" r="7" class="stand"/>' + 
                  '</svg>');
      }
    },//}}}
    'description': '<choose mode="exclusive" xmlns="http://cpee.org/ns/description/1.0"><otherwise/></choose>',
    'permissible_children': function(node) { //{{{
      var func = null;
      if(node.get(0).tagName == 'choose') { func = adaptor.description.insert_first_into }
      else { func = adaptor.description.insert_after }
      if(node.children('parallel_branch').length > 0) {
        return [{'label': 'Parallel Branch', 
         'function_call': func, 
         'menu_icon': elements.parallel_branch.illustrator.svg, 
         'params': [adaptor.description.elements.parallel_branch, node]}];
      }
      var childs = [{'label': 'Alternative', 
       'function_call': func, 
       'menu_icon': elements.alternative.illustrator.svg, 
       'params': [adaptor.description.elements.alternative, node]}];
      if((node.children('otherwise').length == 0) && node.parents('parallel').length == node.parents('parallel_branch').length) 
        childs.push({'label': 'Otherwise', 
         'function_call': func, 
         'menu_icon': elements.otherwise.illustrator.svg, 
         'params': [adaptor.description.elements.otherwise, node]});
      if(node.parents('parallel').length > node.parents('parallel_branch').length) 
        childs.push({'label': 'Parallel Branch', 
         'function_call': func, 
         'menu_icon': elements.parallel_branch.illustrator.svg, 
         'params': [adaptor.description.elements.parallel_branch, node]});
      return childs; 
    }, //}}}
    'adaptor' : {//{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,true, true);
      },
      'click': events.click,
      'dblclick': events.dblclick,
      'mouseover': events.mouseover,
      'mouseout': events.mouseout,
    }//}}}
  };  /*}}}*/
  this.elements.otherwise = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'complex',
      'endnodes' : 'passthrough',
      'closeblock': false,
      'expansion' : function(node) { 
        return 'vertical';
      }, 
      'col_shift' : function(node) { 
        return false; 
      },
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<circle cx="15" cy="15" r="9" class="standtrans"/>' + 
                    '<line x1="9" y1="21" x2="21" y2="9" class="stand"/>' +
                  '</svg>');
      }
    },//}}}
    'description': '<otherwise xmlns="http://cpee.org/ns/description/1.0"/>',
    'neverdelete': true,
    'permissible_children': function(node) { //{{{
      var func = null;
      var childs = null;
      if(node.get(0).tagName == 'otherwise') { func = adaptor.description.insert_first_into }
      else { func = adaptor.description.insert_after }
      return [
        {'label': 'Service Call with Scripts', 
         'function_call': func, 
         'menu_icon': elements.callmanipulate.illustrator.svg, 
         'params': [adaptor.description.elements.callmanipulate, node]},
        {'label': 'Service Call', 
         'function_call': func, 
         'menu_icon': elements.call.illustrator.svg, 
         'params': [adaptor.description.elements.call, node]},
        {'label': 'Script', 
         'function_call': func, 
         'menu_icon': elements.manipulate.illustrator.svg, 
         'params': [adaptor.description.elements.manipulate, node]},
        {'label': 'Parallel', 
         'function_call': func, 
         'menu_icon': elements.parallel.illustrator.svg, 
         'params': [adaptor.description.elements.parallel, node]},
        {'label': 'Choose', 
         'function_call': func, 
         'menu_icon': elements.choose.illustrator.svg, 
         'params': [adaptor.description.elements.choose, node]},
        {'label': 'Loop', 
         'function_call': func, 
         'menu_icon': elements.loop.illustrator.svg, 
         'params': [adaptor.description.elements.loop, node]},
        {'label': 'Critical', 
         'function_call': func, 
         'menu_icon': elements.critical.illustrator.svg, 
         'params': [adaptor.description.elements.critical, node]}
      ];
    }, //}}}
    'adaptor' : {//{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,true, false);
      },
      'click': events.click,
      'dblclick': events.dblclick, 
      'mouseover': events.mouseover,
      'mouseout': events.mouseout,
    }//}}}
  }; /*}}}*/
  this.elements.alternative = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'complex',
      'endnodes' : 'passthrough',
      'closeblock':false,
      'expansion' : function(node) { 
        return 'vertical';
      }, 
      'col_shift' : function(node) { 
        return false;
      },
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<circle cx="15" cy="15" r="14" class="standwithout"/>' + 
                    '<text transform="translate(15,20)" class="normal">{..}</text>' +
                  '</svg>');
      }
    },//}}}
    'description': '<alternative condition="" xmlns="http://cpee.org/ns/description/1.0"/>',
    'permissible_children': function(node) { //{{{
      if(node.get(0).tagName == 'alternative') { func = adaptor.description.insert_first_into }
      else { func = adaptor.description.insert_after }
      if(node.parents('parallel').length > node.parents('parallel_branch').length && node.get(0).tagName == 'alternative') {
        return [{'label': 'Parallel Branch', 
         'function_call': func, 
         'menu_icon': elements.parallel_branch.illustrator.svg, 
         'params': [adaptor.description.elements.parallel_branch, node]}];
      }   
      return [
        {'label': 'Service Call with Scripts', 
         'function_call': func, 
         'menu_icon': elements.callmanipulate.illustrator.svg, 
         'params': [adaptor.description.elements.callmanipulate, node]},
        {'label': 'Service Call', 
         'function_call': func, 
         'menu_icon': elements.call.illustrator.svg, 
         'params': [adaptor.description.elements.call, node]},
        {'label': 'Script', 
         'function_call': func, 
         'menu_icon': elements.manipulate.illustrator.svg, 
         'params': [adaptor.description.elements.manipulate, node]},
        {'label': 'Parallel', 
         'function_call': func, 
         'menu_icon': elements.parallel.illustrator.svg, 
         'params': [adaptor.description.elements.parallel, node]},
        {'label': 'Choose', 
         'function_call': func, 
         'menu_icon': elements.choose.illustrator.svg, 
         'params': [adaptor.description.elements.choose, node]},
        {'label': 'Loop', 
         'function_call': func, 
         'menu_icon': elements.loop.illustrator.svg, 
         'params': [adaptor.description.elements.loop, node]},
        {'label': 'Critical', 
         'function_call': func, 
         'menu_icon': elements.critical.illustrator.svg, 
         'params': [adaptor.description.elements.critical, node]}
      ];
    }, //}}}
    'adaptor' : {//{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,true, false);
      },
      'click': events.click,
      'dblclick': events.dblclick, 
      'mouseover': events.mouseover,
      'mouseout': events.mouseout,
    }//}}}
  };  /*}}}*/
  this.elements.loop = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'complex',
      'endnodes' : 'this',
      'closeblock' : true,
      'expansion' : function(node) {
        return 'vertical';
      },
      'col_shift' : function(node) {
        return true;
      },
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<rect transform="rotate(45,14,12)" x="7" y="3" width="21" height="21" class="stand"/>' +
                    '<line x1="10.5" y1="20.5" x2="20.5" y2="10.5" class="stand"/>' +
                    '<line x1="10.5" y1="10.5" x2="20.5" y2="20.5" class="stand"/>' +
                  '</svg>');
      }
    },// }}}
    'description': '<loop pre_test="" xmlns="http://cpee.org/ns/description/1.0"/>',
    'permissible_children': function(node) { //{{{
      var func = null;
      if(node.get(0).tagName == 'loop') { func = adaptor.description.insert_first_into }
      else { func = adaptor.description.insert_after }
      var childs = [
        {'label': 'Service Call with Scripts', 
         'function_call': func, 
         'menu_icon': elements.callmanipulate.illustrator.svg, 
         'params': [adaptor.description.elements.callmanipulate, node]},
        {'label': 'Service Call', 
         'function_call': func, 
         'menu_icon': elements.call.illustrator.svg, 
         'params': [adaptor.description.elements.call, node]},
        {'label': 'Manipulate', 
         'function_call': func, 
         'menu_icon': elements.manipulate.illustrator.svg, 
         'params': [adaptor.description.elements.manipulate, node]},
        {'label': 'Choose', 
         'function_call': func, 
         'menu_icon': elements.choose.illustrator.svg, 
         'params': [adaptor.description.elements.choose, node]},
        {'label': 'Loop', 
         'function_call': func, 
         'menu_icon': elements.loop.illustrator.svg, 
         'params': [adaptor.description.elements.loop, node]},
        {'label': 'Critical', 
         'function_call': func, 
         'menu_icon': elements.critical.illustrator.svg, 
         'params': [adaptor.description.elements.critical, node]}
      ];
      if(node.parent('parallel').length > node.parent('parallel_branch').length) {
        childs.push({'label': 'Parallel Branch',
                     'function_call': func, 
                     'menu_icon': elements.parallel_branch.illustrator.svg, 
                     'params': [adaptor.description.elements.parallel_branch, node]}
                    );
      } else {
        childs.push({'label': 'Parallel',
                     'function_call': func, 
                     'menu_icon': elements.parallel.illustrator.svg, 
                     'params': [adaptor.description.elements.parallel, node]}
                    );
      }
      return childs;
    }, //}}}
    'adaptor' : {//{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,true, true);
      },
      'click': events.click,
      'dblclick': events.dblclick, 
      'mouseover': events.mouseover,
      'mouseout': events.mouseout,
    }//}}}
  };  /*}}}*/
  this.elements.parallel = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'complex',
      'endnodes' : 'this',
      'closeblock' : false,
      'border': true,
      'expansion' : function(node) { 
        // check if any sibling other than 'parallel_branch' is present 
        if($(node).children(':not(parallel_branch)').length > 0) return 'vertical';
        return 'horizontal';
      },
      'col_shift' : function(node) {
        return true;
      },
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<rect transform="rotate(45,14,12)" x="7" y="3" width="21" height="21" class="stand"/>' +
                    '<text transform="translate(12,25)" class="normallarge">+</text>' +
                    '<text transform="translate(18,16)" class="small">=</text>' +
                  '</svg>');
      }
    },//}}}
    'description': '<parallel xmlns="http://cpee.org/ns/description/1.0"/>',
    'permissible_children': function(node) { //{{{
      var childs =  [
        {'label': 'Service Call with Scripts', 
         'function_call': adaptor.description.insert_last_into, 
         'menu_icon': elements.callmanipulate.illustrator.svg, 
         'params': [adaptor.description.elements.callmanipulate, node]},
        {'label': 'Service Call', 
         'function_call': adaptor.description.insert_last_into, 
         'menu_icon': elements.call.illustrator.svg, 
         'params': [adaptor.description.elements.call, node]},
        {'label': 'Manipulate', 
         'function_call': adaptor.description.insert_last_into, 
         'menu_icon': elements.manipulate.illustrator.svg, 
         'params': [adaptor.description.elements.manipulate, node]},
        {'label': 'Choose', 
         'function_call': adaptor.description.insert_last_into, 
         'menu_icon': elements.choose.illustrator.svg, 
         'params': [adaptor.description.elements.choose, node]},
        {'label': 'Loop', 
         'function_call': adaptor.description.insert_last_into, 
         'menu_icon': elements.loop.illustrator.svg, 
         'params': [adaptor.description.elements.loop, node]},
        {'label': 'Critical', 
         'function_call': adaptor.description.insert_last_into, 
         'menu_icon': elements.critical.illustrator.svg, 
         'params': [adaptor.description.elements.critical, node]},
        {'label': 'Parallel Branch',
         'function_call': adaptor.description.insert_last_into, 
         'menu_icon': elements.parallel_branch.illustrator.svg, 
         'params': [adaptor.description.elements.parallel_branch, node]}
      ];
      if(node.get(0).tagName != 'parallel')
        childs.push({'label': 'Parallel', 
           'function_call': adaptor.description.insert_last_into, 
           'menu_icon': elements.parallel.illustrator.svg, 
           'params': [adaptor.description.elements.parallel, node]});
      return childs;
    }, //}}}
    'adaptor' : {//{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,true, true);
      },
      'click': events.click,
      'dblclick': events.dblclick, 
      'mouseover': events.mouseover,
      'mouseout': events.mouseout,
    }//}}}
  };  /*}}}*/
  this.elements.parallel_branch = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'complex',
      'endnodes' : 'this',
      'closeblock' : false,
      'expansion' : function(node) { 
        return 'vertical';
      },
      'col_shift' : function(node) {
        if(node.parentNode.tagName == 'choose') return false;
        if($(node).parents('parallel').first().children(':not(parallel_branch)').length > 0) return true;
        return false; 
      },
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<rect transform="rotate(45,14,12)" x="7" y="3" width="21" height="21" class="stand"/>' +
                    '<text transform="translate(15,20)" class="small">+|</text>' +
                  '</svg>');
      }
    },//}}}
    'description': '<parallel_branch xmlns="http://cpee.org/ns/description/1.0"/>',
    'permissible_children': function(node) { //{{{
      var func = null;
      var childs = null;
      if(node.get(0).tagName == 'parallel_branch') { func = adaptor.description.insert_first_into }
      else { func = adaptor.description.insert_after }
      childs =  [
        {'label': 'Service Call with Scripts', 
         'function_call': func, 
         'menu_icon': elements.callmanipulate.illustrator.svg, 
         'params': [adaptor.description.elements.callmanipulate, node]},
        {'label': 'Service Call', 
         'function_call': func, 
         'menu_icon': elements.call.illustrator.svg, 
         'params': [adaptor.description.elements.call, node]},
        {'label': 'Script', 
         'function_call': func, 
         'menu_icon': elements.manipulate.illustrator.svg, 
         'params': [adaptor.description.elements.manipulate, node]},
        {'label': 'Parallel', 
         'function_call': func, 
         'menu_icon': elements.parallel.illustrator.svg, 
         'params': [adaptor.description.elements.parallel, node]},
        {'label': 'Choose', 
         'function_call': func, 
         'menu_icon': elements.choose.illustrator.svg, 
         'params': [adaptor.description.elements.choose, node]},
        {'label': 'Loop', 
         'function_call': func, 
         'menu_icon': elements.loop.illustrator.svg, 
         'params': [adaptor.description.elements.loop, node]},
        {'label': 'Critical', 
         'function_call': func, 
         'menu_icon': elements.critical.illustrator.svg, 
         'params': [adaptor.description.elements.critical, node]},
      ];
      if(node.parents('choose').length > node.parents('alternative, otherwise').length && node.get(0).tagName == 'parallel_branch') {
        return [{'label': 'Alternative', 
         'function_call': func, 
         'menu_icon': elements.alternative.illustrator.svg, 
         'params': [adaptor.description.elements.alternative, node]}];
      }
      return childs;
    }, //}}}
    'adaptor' : {//{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,true, false);
      },
      'click': events.click,
      'dblclick': events.dblclick, 
      'mouseover': events.mouseover,
      'mouseout': events.mouseout,
    }//}}}
  };  /*}}}*/
  this.elements.critical = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'complex',
      'endnodes' : 'aggregate',
      'closeblock' : false,
      'border': true,
      'expansion' : function(node) {
        return 'vertical';
      },
      'col_shift' : function(node) {
        return true;
      },
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<circle cx="15" cy="15" r="14" class="stand"/>' + 
                    '<text transform="translate(15,21)" class="normal">⚠</text>' +
                  '</svg>');
      }
    },//}}}
    'description': '<critical sid="section" xmlns="http://cpee.org/ns/description/1.0"/>',
    'permissible_children': function(node) { //{{{
      var func = null;
      if(node.get(0).tagName == 'critical') { func = adaptor.description.insert_first_into }
      else { func = adaptor.description.insert_after }
      return [
        {'label': 'Service Call with Scripts', 
         'function_call': func, 
         'menu_icon': elements.callmanipulate.illustrator.svg, 
         'params': [adaptor.description.elements.callmanipulate, node]},
        {'label': 'Service Call', 
         'function_call': func, 
         'menu_icon': elements.call.illustrator.svg, 
         'params': [adaptor.description.elements.call, node]},
        {'label': 'Script', 
         'function_call': func, 
         'menu_icon': elements.manipulate.illustrator.svg, 
         'params': [adaptor.description.elements.manipulate, node]},
        {'label': 'Parallel', 
         'function_call': func, 
         'menu_icon': elements.parallel.illustrator.svg, 
         'params': [adaptor.description.elements.parallel, node]},
        {'label': 'Choose', 
         'function_call': func, 
         'menu_icon': elements.choose.illustrator.svg, 
         'params': [adaptor.description.elements.choose, node]},
        {'label': 'Loop', 
         'function_call': func, 
         'menu_icon': elements.loop.illustrator.svg, 
         'params': [adaptor.description.elements.loop, node]},
        {'label': 'Critical', 
         'function_call': func, 
         'menu_icon': elements.critical.illustrator.svg, 
         'params': [adaptor.description.elements.critical, node]},
      ];
    }, //}}}
    'adaptor' : {//{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,true, true);
      },
      'click': events.click,
      'dblclick': events.dblclick, 
      'mouseover': events.mouseover,
      'mouseout': events.mouseout,
    }//}}}
  };  /*}}}*/
  this.elements.group = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'complex',
      'endnodes' : 'aggregate',
      'closeblock' : false,
      'border': 'injectiongroup', // other value than true,false inidcates the used class for the svg-object
      'expansion' : function(node) {
        return 'vertical';
      },
      'col_shift' : function(node) {
        return true;
      },
      'svg': function() {
        return false;
      }
    },//}}}
    'description': '<group xmlns="http://cpee.org/ns/description/1.0"/>',
    'permissible_children': function(node) { //{{{
      var func = null;
      if(node.get(0).tagName == 'group') { func = adaptor.description.insert_first_into }
      else { func = adaptor.description.insert_after }
      return [
      ];
    }, //}}}
    'adaptor' : {//{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,true, true);
      },
      'click': events.click,
      'dblclick': events.dblclick, 
      'mouseover': events.mouseover,
      'mouseout': events.mouseout,
    }//}}}
  };  /*}}}*/
  this.elements.start = this.elements.description = { /*{{{*/
    'illustrator': {//{{{
      'type' : 'description',
      'endnodes' : 'passthrough',
      'closeblock' : false,
      'expansion' : function(node) {
        return 'vertical';
      },
      'col_shift' : function(node) {
        return true;
      },
      'svg': function() {
        return $X('<svg class="clickable" xmlns="http://www.w3.org/2000/svg">' + 
                    '<circle cx="15" cy="15" r="14" class="stand"/>' +
                  '</svg>');
      }
    },//}}}
    'description': null,
    'permissible_children': function(node) { //{{{
      var func = null;
      if(node.get(0).tagName == 'description') { func = adaptor.description.insert_first_into }
      else { func = adaptor.description.insert_after }
      return [
        {'label': 'Service Call with Scripts', 
         'function_call': func, 
         'menu_icon': elements.callmanipulate.illustrator.svg, 
         'params': [adaptor.description.elements.callmanipulate, node]},
        {'label': 'Service Call', 
         'function_call': func, 
         'menu_icon': elements.call.illustrator.svg, 
         'params': [adaptor.description.elements.call, node]},
        {'label': 'Script Task', 
         'function_call': func, 
         'menu_icon': elements.manipulate.illustrator.svg, 
         'params': [adaptor.description.elements.manipulate, node]},
        {'label': 'Parallel', 
         'function_call': func, 
         'menu_icon': elements.parallel.illustrator.svg, 
         'params': [adaptor.description.elements.parallel, node]},
        {'label': 'Choose', 
         'function_call': func, 
         'menu_icon': elements.choose.illustrator.svg, 
         'params': [adaptor.description.elements.choose, node]},
        {'label': 'Loop', 
         'function_call': func, 
         'menu_icon': elements.loop.illustrator.svg, 
         'params': [adaptor.description.elements.loop, node]},
        {'label': 'Critical', 
         'function_call': func, 
         'menu_icon': elements.critical.illustrator.svg, 
         'params': [adaptor.description.elements.critical, node]}
      ];
    }, //}}}
    'adaptor' : {//{{{
      'mousedown': function (node, e) {
        events.mousedown(node,e,true, false);
      },
      'click': events.click,
      'dblclick': events.dblclick, 
      'mouseover': events.mouseover,
      'mouseout': events.mouseout,
    }//}}}
  }; /*}}}*/
}
