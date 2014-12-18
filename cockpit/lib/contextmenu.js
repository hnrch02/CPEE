/*
  This file is part of CPEE.

  CPEE is free software: you can redistribute it and/or modify it under the terms
  of the GNU General Public License as published by the Free Software Foundation,
  either version 3 of the License, or (at your option) any later version.

  CPEE is distributed in the hope that it will be useful, but WITHOUT ANY
  WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
  PARTICULAR PURPOSE.  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  CPEE (file COPYING in the main directory).  If not, see
  <http://www.gnu.org/licenses/>.
*/

function contextmenu(items, e) {
  var x = e.pageX;
  var y = e.pageY;
  if($('div.contextmenu').length > 0) contextmenu_remove();
  var div = $('<div class="contextmenu"><table class="contextmenu"/></div>');
  for(head in items) {
    div.children(':first').append('<tr class="contextmenuheader"><td colspan="2">' + head + '</td></tr>');
    for(item in items[head]) {
      var icon = null;
      if(items[head][item].menu_icon) {
        icon = $X('<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' +
                    '<g transform="translate(1,1) scale(0.5, 0.5)"/>' +
                  '</svg>');
        icon.children('g').append(items[head][item].menu_icon().children());
        icon = icon.serializeXML();
      }
      var row = $('<tr class="contextmenuitem"><td class="contextmenuicon"><div>' + (icon == null ? '' : icon) + '</div></td><td>' + items[head][item].label + '</td></tr>');
      div.children(':first').append(row);
      row.bind('click', items[head][item], function(event){
        event.data.function_call.apply(null, event.data.params);
      });
    }
  }
  div.css({'left':x+5,'top':y+5, 'display':'block'});
  $('body', document).append(div);
  if(($(window).height() < (y + div.height()))) { // contextmenu is position
    div.css({'top':$(window).height()-div.height()-5});
  }
  if((document.body.clientWidth < (x + div.width())) && (x-div.width()-5 >= 0)) { // contextmenu is position
    div.css({'left':x-div.width()-5});
  }
  e.stopPropagation();
  $('body', document).bind('mousedown',contextmenu_remove); 
}

function contextmenu_remove(event) {
  if (!event) {
    $('.contextmenu:first').remove();
    $('body', document).unbind('mousedown',contextmenu_remove);
    return;
  }  

  if($(event.target).parent('tr.contextmenuitem') && (event.button == 0)) { $(event.target).click(); } 
  $('.contextmenu:first').remove();
  $('body', document).unbind('mousedown',contextmenu_remove);
}
