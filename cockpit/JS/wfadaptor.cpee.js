function create_cpee_elements(adaptor) {
  var illustrator = adaptor.illustrator;
  var description = adaptor.description;
  var elements = {};

  // Abstracts 
  elements.call_manipulate = { /*{{{*/
    'illustrator': {
      'type' : 'abstract', 
      'draw' : function(node, pos, block) { 
        return illustrator.draw.draw_symbol('callmanipulate', $(node).attr('svg-id'), pos.row, pos.col);
        },
      'svg_def': function() {
        var svgNS = "http://www.w3.org/2000/svg";
        var symbol = document.createElementNS(svgNS, "symbol");
        var attrs = {'id':'callmanipulate','class':'clickable'};
        for(attr in attrs) symbol.setAttribute(attr, attrs[attr]);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':14,'class':'stand'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(15,21)','class':'normal'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('c'));
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':28, 'cy':27, 'r':9,'class':'stand'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(28,31)','class':'small'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('m'));
        symbol.appendChild(sub);
        return symbol;
      }
    },
    'description' : {
      'create':  function(only_manipulate) {
        var node = null;
        if(only_manipulate) {
          node = $('<manipulate/>');
        } else {
          node = $('<call><manipulate/></call>');
        }
          return node;
      },
      'insertable' : function(parent_node, index) {
        return true;
        return false;
      },
    },
    'adaptor' : {
      'right_click' : function(node) { 
        console.log('rightclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      }, 
      'left_click' : function(node) { 
        console.log('PANG -> DEAD! leftclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      } 
    }
  }; /*}}}*/

  // Primitives 
  elements.call = { /*{{{*/
    'illustrator': {
      'type' : 'primitive', 
      'endnodes' : 'this',
      'draw' : function(node, pos, block) { 
        if($(node).children('manipulate').length > 0) {
          return illustrator.elements.call_manipulate.draw(node, pos, block);
        } else {
          return illustrator.draw.draw_symbol('call', $(node).attr('svg-id'), pos.row, pos.col);
        }
      },
      'svg_def': function() {
        var svgNS = "http://www.w3.org/2000/svg";
        var symbol = document.createElementNS(svgNS, "symbol");
        var attrs = {'id':'call','class':'clickable'};
        for(attr in attrs) symbol.setAttribute(attr, attrs[attr]);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':14,'class':'stand'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(15,21)','class':'normal'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('c'));
        symbol.appendChild(sub);
        return symbol;
      }
    },
    'description' : {
      'create':  function() {
        var node = $('<call/>');
        return node;
      },
      'insertable' : function(parent_node, index) {
        return true;
        return false;
      },
    },
    'adaptor' : {
      'right_click' : function(node, e) { 
        var node_id = $(node).parents(':first').attr('id');
        console.log('rightclick on call with id ' + node_id);
        var menu_items = {
          'Insert Call after': {'function_call': description.insert_after, 'params': [description.elements.call.create(), node_id]},
          'Insert Manipulate after': {'function_call': description.insert_after, 'params': [description.elements.call.create(), node_id]},
          'Insert Choose after': {'function_call': description.insert_after, 'params': [description.elements.call.create(), node_id]},
          'Insert Parallel after': {'function_call': description.insert_after, 'params': [description.elements.call.create(), node_id]},
          'Insert Parallel Branch after': {'function_call': description.insert_after, 'params': [description.elements.call.create(), node_id]},
          'Insert Loop after': {'function_call': description.insert_after, 'params': [description.elements.call.create(), node_id]},
          'Insert Critical after': {'function_call': description.insert_after, 'params': [description.elements.call.create(), node_id]},
        }
        if(description.get_node_by_svg_id(node_id).children('manipulate').length == 0) {
          menu_items['Insert Manipulate into'] = {'function_call': description.append, 'params': [description.elements.call_manipulate.create(true), node_id]};
        } 
        contextmenu(menu_items, e.pageX, e.pageY);
        return false;
      }, 
      'left_click' : function(node, e) { 
        console.log('PANG -> DEAD! leftclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      } 
    }
  }; /*}}}*/

  elements.manipulate = { /*{{{*/
    'illustrator': {
      'type' : 'primitive',
      'endnodes' : 'this',
      'draw' : function(node, pos, block) { 
        return illustrator.draw.draw_symbol('manipulate', $(node).attr('svg-id'), pos.row, pos.col);
      },
      'svg_def': function() {
        var svgNS = "http://www.w3.org/2000/svg";
        var symbol = document.createElementNS(svgNS, "symbol");
        var attrs = {'id':'manipulate','class':'clickable'};
        for(attr in attrs) symbol.setAttribute(attr, attrs[attr]);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':14,'class':'stand'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(15,21)','class':'normal'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('m'));
        symbol.appendChild(sub);
        return symbol;
      }
    },
    'description' : {
      'create':  function() {
        var node = $('');
        return node;
      },
      'insertable' : function(parent_node, index) {
        return true;
        return false;
      },
    },
    'adaptor' : {
      'right_click' : function(node) { 
        console.log('rightclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      }, 
      'left_click' : function(node) { 
        console.log('PANG -> DEAD! leftclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      } 
    }
  }; /*}}}*/

// Complex 
  elements.choose = { /*{{{*/
    'illustrator': {
      'type' : 'complex',
      'endnodes' : 'aggregate',
      'closeblock': false,
      'draw' : function(node, pos, block) { 
        return illustrator.draw.draw_symbol('choose', $(node).attr('svg-id'), pos.row, pos.col);
      }, 
      'expansion' : function(node) { 
        return 'horizontal';
      }, 
      'col_shift' : function(node) { 
        return false; 
      },
      'svg_def': function() {
        var svgNS = "http://www.w3.org/2000/svg";
        var symbol = document.createElementNS(svgNS, "symbol");
        var attrs = {'id':'choose','class':'clickable'};
        for(attr in attrs) symbol.setAttribute(attr, attrs[attr]);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':14,'class':'stand'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(15,21)','class':'normal'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('σ'));
        symbol.appendChild(sub);
        return symbol;
      }
    },
    'description' : {
      'create':  function() {
        var node = $('');
        return node;
      },
      'insertable' : function(parent_node, index) {
        return true;
        return false;
      },
    },
    'adaptor' : {
      'right_click' : function(node) { 
        console.log('rightclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      }, 
      'left_click' : function(node) { 
        console.log('PANG -> DEAD! leftclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      } 
    }
  };  /*}}}*/

  elements.otherwise = { /*{{{*/
    'illustrator': {
      'type' : 'complex',
      'endnodes' : 'passthrough',
      'closeblock': false,
      'draw' : function(node, pos, block) { 
        return illustrator.draw.draw_symbol('otherwise', $(node).attr('svg-id'), pos.row, pos.col);
      }, 
      'expansion' : function(node) { 
        return 'vertical';
      }, 
      'col_shift' : function(node) { 
        return false; 
      },
      'svg_def': function() {
        var svgNS = "http://www.w3.org/2000/svg";
        var symbol = document.createElementNS(svgNS, "symbol");
        var attrs = {'id':'otherwise','class':'clickable'};
        for(attr in attrs) symbol.setAttribute(attr, attrs[attr]);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':14,'class':'standwithout'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(15,20)','class':'normal'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('{⁎}'));
        symbol.appendChild(sub);
        return symbol;
      }
    },
    'description' : {
      'create':  function() {
        var node = $('');
        return node;
      },
      'insertable' : function(parent_node, index) {
        return true;
        return false;
      },
    },
    'adaptor' : {
      'right_click' : function(node) { 
        console.log('rightclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      }, 
      'left_click' : function(node) { 
        console.log('PANG -> DEAD! leftclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      } 
    }
  }; /*}}}*/
  
  elements.alternative = { /*{{{*/
    'illustrator': {
      'type' : 'complex',
      'endnodes' : 'passthrough',
      'closeblock':false,
      'draw' : function(node, pos, block) { 
        return illustrator.draw.draw_symbol('alternative', $(node).attr('svg-id'), pos.row, pos.col);
      }, 
      'expansion' : function(node) { 
        return 'vertical';
      }, 
      'col_shift' : function(node) { 
        return false;
      },
      'svg_def': function() {
        var svgNS = "http://www.w3.org/2000/svg";
        var symbol = document.createElementNS(svgNS, "symbol");
        var attrs = {'id':'alternative','class':'clickable'};
        for(attr in attrs) symbol.setAttribute(attr, attrs[attr]);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':14,'class':'standwithout'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(15,20)','class':'normal'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('{..}'));
        symbol.appendChild(sub);
        return symbol;
      }
    },
    'description' : {
      'create':  function() {
        var node = $('');
        return node;
      },
      'insertable' : function(parent_node, index) {
        return true;
        return false;
      },
    },
    'adaptor' : {
      'right_click' : function(node) { 
        console.log('rightclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      }, 
      'left_click' : function(node) { 
        console.log('PANG -> DEAD! leftclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      } 
    }
  };  /*}}}*/
  
  elements.loop = { /*{{{*/
    'illustrator': {
      'type' : 'complex',
      'endnodes' : 'this',
      'closeblock' : true,
      'draw' : function(node, pos, block) {
        return illustrator.draw.draw_symbol('loop', $(node).attr('svg-id'), pos.row, pos.col);
      },
      'expansion' : function(node) {
        return 'vertical';
      },
      'col_shift' : function(node) {
        return true;
      },
      'svg_def': function() {
        var svgNS = "http://www.w3.org/2000/svg";
        var symbol = document.createElementNS(svgNS, "symbol");
        var attrs = {'id':'loop','class':'clickable'};
        for(attr in attrs) symbol.setAttribute(attr, attrs[attr]);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':14,'class':'stand'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(15,23)','class':'normallarge'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('↺'));
        symbol.appendChild(sub);
        return symbol;
      }
    },
    'description' : {
      'create':  function() {
        var node = $('');
        return node;
      },
      'insertable' : function(parent_node, index) {
        return true;
        return false;
      },
    },
    'adaptor' : {
      'right_click' : function(node) { 
        console.log('rightclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      }, 
      'left_click' : function(node) { 
        console.log('PANG -> DEAD! leftclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      } 
    }
  };  /*}}}*/
  
  elements.parallel = { /*{{{*/
    'illustrator': {
      'type' : 'complex',
      'endnodes' : 'this',
      'closeblock' : false,
      'draw' : function(node, pos, block) {
        illustrator.draw.draw_border(pos,block.max);
        return illustrator.draw.draw_symbol('parallel', $(node).attr('svg-id'), pos.row, pos.col);
      },
      'expansion' : function(node) { 
        // check if any sibling other than 'parallel_branch' is present 
        if($(node).children(':not(parallel_branch)').length > 0) return 'vertical';
        return 'horizontal';
      },
      'col_shift' : function(node) {
        return true;
      },
      'svg_def': function() {
        var svgNS = "http://www.w3.org/2000/svg";
        var symbol = document.createElementNS(svgNS, "symbol");
        var attrs = {'id':'parallel','class':'clickable'};
        for(attr in attrs) symbol.setAttribute(attr, attrs[attr]);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':14,'class':'stand'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(15,21)','class':'normal'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('||'));
        symbol.appendChild(sub);
        return symbol;
      }
    },
    'description' : {
      'create':  function() {
        var node = $('');
        return node;
      },
      'insertable' : function(parent_node, index) {
        return true;
        return false;
      },
    },
    'adaptor' : {
      'right_click' : function(node) { 
        console.log('rightclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      }, 
      'left_click' : function(node) { 
        console.log('PANG -> DEAD! leftclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      } 
    }
  };  /*}}}*/
  
  elements.parallel_branch = { /*{{{*/
    'illustrator': {
      'type' : 'complex',
      'endnodes' : 'this',
      'closeblock' : false,
      'draw' : function(node, pos, block) {
        return illustrator.draw.draw_symbol('parallel_branch', $(node).attr('svg-id'), pos.row, pos.col);
      },
      'expansion' : function(node) { 
        return 'vertical';
      },
      'col_shift' : function(node) {
        if($(node).parents('parallel').first().children(':not(parallel_branch)').length > 0) return true;
        return false; 
      },
      'svg_def': function() {
        var svgNS = "http://www.w3.org/2000/svg";
        var symbol = document.createElementNS(svgNS, "symbol");
        var attrs = {'id':'parallel_branch','class':'clickable'};
        for(attr in attrs) symbol.setAttribute(attr, attrs[attr]);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':14,'class':'stand'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(15,20)','class':'normal'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('|'));
        symbol.appendChild(sub);
        return symbol;
      }
    },
    'description' : {
      'create':  function() {
        var node = $('');
        return node;
      },
      'insertable' : function(parent_node, index) {
        return true;
        return false;
      },
    },
    'adaptor' : {
      'right_click' : function(node) { 
        console.log('rightclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      }, 
      'left_click' : function(node) { 
        console.log('PANG -> DEAD! leftclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      } 
    }
  };  /*}}}*/
  
  elements.critical = { /*{{{*/
    'illustrator': {
      'type' : 'complex',
      'endnodes' : 'aggregate',
      'closeblock' : false,
      'draw' : function(node, pos, block) {
        illustrator.draw.draw_border(pos,block.max);
        return illustrator.draw.draw_symbol('critical', $(node).attr('svg-id'), pos.row, pos.col);
      },
      'expansion' : function(node) {
        return 'vertical';
      },
      'col_shift' : function(node) {
        return true;
      },
      'svg_def': function() {
        var svgNS = "http://www.w3.org/2000/svg";
        var symbol = document.createElementNS(svgNS, "symbol");
        var attrs = {'id':'critical','class':'clickable'};
        for(attr in attrs) symbol.setAttribute(attr, attrs[attr]);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':14,'class':'stand'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(16.5,21.5)','class':'normal'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('⚠'));
        symbol.appendChild(sub);
        return symbol;
      }
    },
    'description' : {
      'create':  function() {
        var node = $('');
        return node;
      },
      'insertable' : function(parent_node, index) {
        return true;
        return false;
      },
    },
    'adaptor' : {
      'right_click' : function(node) { 
        console.log('rightclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      }, 
      'left_click' : function(node) { 
        console.log('PANG -> DEAD! leftclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      } 
    }
  };  /*}}}*/
  
  elements.description = { /*{{{*/
    'illustrator': {
      'type' : 'description',
      'endnodes' : 'passthrough',
      'closeblock' : false,
      'draw' : function(node, pos, block) {
        return illustrator.draw.draw_symbol('end', $(node).attr('svg-id'), pos.row, pos.col);
      },
      'expansion' : function(node) {
        return 'vertical';
      },
      'col_shift' : function(node) {
        return true;
      },
      'svg_def': function() {
        var svgNS = "http://www.w3.org/2000/svg";
        var symbol = document.createElementNS(svgNS, "symbol");
        var attrs = {'id':'end','class':'clickable'};
        for(attr in attrs) symbol.setAttribute(attr, attrs[attr]);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':14,'class':'stand'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "circle");
        attrs = {'cx':15, 'cy':15,'r':11,'class':'stand'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        symbol.appendChild(sub);
        var sub = document.createElementNS(svgNS, "text");
        attrs = {'transform':'translate(15,21)','class':'normal'};
        for(attr in attrs) sub.setAttribute(attr, attrs[attr]);
        sub.appendChild(document.createTextNode('Ω'));
        symbol.appendChild(sub);
        return symbol;
      }
    },
    'description' : {
      'create':  function() {
        var node = $('');
        return node;
      },
      'insertable' : function(parent_node, index) {
        return true;
        return false;
      },
    },
    'adaptor' : {
      'right_click' : function(node) { 
        console.log('rightclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      }, 
      'left_click' : function(node) { 
        console.log('PANG -> DEAD! leftclick on call with id ' + $(node).parents(':first').attr('id'));
        return false;
      } 
    }
  }; /*}}}*/
   
   console.log('Adaptor: adding cpee elements');
    for(element in elements) {
      // Illsutrator
      illustrator.elements[element] = elements[element].illustrator;
      illustrator.svg.defs.append(elements[element].illustrator.svg_def);
      // Description
      description.elements[element] = elements[element].description;
      // Adaptor
      adaptor.elements[element] = elements[element].adaptor;
    }

  return elements;
}   
