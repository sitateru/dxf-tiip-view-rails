
Array.prototype.clear = function() {
  while (this.length) {
    this.pop();
  }
};

function createTable(keyValue){
  var $table = $('<table class="table"></table>');
  var $th = $('<tr></tr>');
  var $td = $('<tr></tr>');

  $table.append($th);
  $table.append($td);
  $("#metadata").append($table);

  for(var e of keyValue){

    $th.append($('<th>'+e[0]+'</th>'));
    $td.append($('<td>'+e[1]+'</td>'));
  }
  return $table;
}


class Entity {
  constructor(entity, block, view){
    this.entity = entity;
    this.block = block;
    this.view = view;

    this.texts = [];
    this.textsWithoutComment = [];


    for (var block_entity of block.entities){
      if(block_entity.type == "TEXT"){
        {
          var[k, v] = block_entity.text.split(':');
          v = v.replace(' ', '');
          this.texts.push([k, v]);
        }
        if(block_entity.text.indexOf("COMMENT")>=0){
          block_entity.text = block_entity.text.split(':')[1];
          // block_entity.startPoint = {x:0,y:0,z:0};
        }else{
          var[k, v] = block_entity.text.split(':');
          v = v.replace(' ', '');
          block_entity.text = "";
          this[k.toLowerCase()] = v;
          this.textsWithoutComment.push([k, v]);
        }
      }
    }
  }

  setVisible(b){
    this.entity.object.visible = b;
  }

  createCheckbox(){

    var entity = this.entity;
    var block = this.block;

    var name = this.entity.name;

    var card = $('<div class="card"></div>');
    var card_header = $(
      '<div class="card-header" role="tab" id="heading-'+name+'"></div>');
    var card_header_a = $('<a data-toggle="collapse" data-parent="#accordion" href="#collapse-'+name+'"'+
      ' aria-expanded="true" aria-controls="collapse-'+name+'">'+
      '<i class="ion-arrow-right-b"></i> '+
      '</a>');
    var card_block = $(
      '<div id="collapse-'+name+'" class="collapse" role="tabpanel" aria-labelledby="heading-'+name+'">'+
      '<div class="card-block">'+
      '</div></div>');

    card.append(card_header);
    card_header.append(card_header_a);
    card.append(card_block);

    var checkbox = $('<input type="checkbox" id="'+name+'" checked/> '
        +'<label for="'+name+'">'+name+'<span class="piece-name">'+this.piece+'</span></label>');
    card_header.append(checkbox);

    var focus = $(' <i class="ion-qr-scanner card-tool"></i>');
    card_header.append(focus);

    var entity = this;
    checkbox.change(function(){
    	if ($(this).is(':checked')) {
        entity.setVisible(true);
        entity.view.render();

        // self.cadCanvas.focus(self.entities[0].entity.object);
    	} else {
        entity.setVisible(false);
        entity.view.render();

    	}
    });

    focus.click(function(){
      entity.view.cadCanvas.focus(entity.entity.object);
    });

    card_block.append(createTable(this.textsWithoutComment));

    // var ul = $('<ul></ul>');
    // for (var ii in this.texts){
    //   var text = this.texts[ii];
    //   ul.append('<li>'+text[0]+" : "+text[1]+'</li>');
    // }
    // card_block.append(ul);

    return card;
  }

}

class DxfTiipView {

  static set(selector, htmlfilepath){
    var url = $(selector).attr('url')

    var $target = $(selector);
    $target.click(open);

    function open(){
      var features = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
      var win = window.open(htmlfilepath+"?url="+url, "DXF TIIP View", features);
    }

  }
  
  constructor(){
    this.progress = document.getElementById('file-progress-bar');
    this.$progress = $('.progress');

    this.$cadview = $('#cad-view');
    this.cadCanvas;

    this.dxf;
    this.font;
    this.font_path;

    this.dataLoading = false;
    this.entities = [];
  }
  
  load(url, data, font_path){
    
    this.font_path = font_path;
    
    var self = this;
    $.ajax({
          type: "POST",
          beforeSend: function(xhr){
            xhr.overrideMimeType('text/plane;charset=Shift_JIS');
          },
          url: url,
          data: data,
          async: true,
          success: function(data){
            self.loadDxf(data)
          }
      });
  }

  loadDxf(data){
    //
    var parser = new window.DxfParser();
    this.dxf = parser.parseSync(data);
    console.log(this.dxf);

    this.loadMetadata(this.dxf);
    this.updateEntities(this.dxf);
    this.createCheckboxes(this.dxf);
    this.drawThreeDxf();

  }

  loadMetadata(dxf){
    $("#metadata").empty();
    var es = dxf.entities;

    var keyValue = [];
    for(var e of es){
      if(e.type == "TEXT"){
        var ss = e.text.split(':');
        keyValue.push([ss[0], ss[1]])
      }
    }
    $("#metadata").append(createTable(keyValue));
  }

  createCheckboxes(dxf){
    $("#checkboxes").empty();
    var accordion = $('<div id="accordion" role="tablist" aria-multiselectable="true"></div>');
    $("#checkboxes").append(accordion);

    for(var i=0; i< this.entities.length; i++){
      var entity = this.entities[i];
      var cb = entity.createCheckbox();
      accordion.append(cb);
    }
  }

  updateEntities(dxf){

    if(dxf == null)
      return;

    this.entities.clear();

    var dd = $.extend(true, {}, dxf);
    this.data = dd;

    for (var i = 0; i < dd.entities.length; i++) {
      var entity = dd.entities[i];

      if(entity.name !== undefined){
        var block = dd.blocks[entity.name];

        var entityObj = new Entity(entity, block, this);
        this.entities.push(entityObj);

      }
    }

  }

  drawThreeDxf(){
    var data = this.data
    // Three.js changed the way fonts are loaded, and now we need to use FontLoader to load a font
    //  and enable TextGeometry. See this example http://threejs.org/examples/?q=text#webgl_geometry_text
    //  and this discussion https://github.com/mrdoob/three.js/issues/7398
    var loader = new THREE.FontLoader();

    var self = this;
    
    loader.load( this.font_path, function ( response ) {
        self.font = response;
        var elem = document.getElementById('cad-view');

        //remove all elements
        while (elem.firstChild) elem.removeChild(elem.firstChild);

        //remove all listeners
        var new_element = elem.cloneNode(true);
        elem.parentNode.replaceChild(new_element, elem);

        var w = $("#cad-view").parent().width();
        self.cadCanvas = new ThreeDxf.Viewer(data, document.getElementById('cad-view'), w, w, self.font);
        self.addMeasuringFunction(self.cadCanvas, self.font);

    });
  }

  render(){
    if(this.cadCanvas !== undefined){
      this.cadCanvas.render();
    }
  }

  addMeasuringFunction(cadCanvas, font){
    (function(){
      var text = undefined;
      var line = undefined;
      var clickedPos = undefined;
      var canvas = document.getElementById('cad-view');
      canvas.addEventListener("mousedown", function(e){

        var geometry = new THREE.Geometry();
        geometry.dynamic = true;
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));

        var material = new THREE.LineBasicMaterial({ linewidth: 1, color: 0x0000ff });

        line = new THREE.Line(geometry, material);
        cadCanvas.scene.add(line);

        var pos = cadCanvas.project(e.pageX, e.pageY);
        clickedPos = pos;
        line.geometry.vertices[0].x = pos.x;
        line.geometry.vertices[0].y = pos.y;
        line.geometry.vertices[1].x = pos.x;
        line.geometry.vertices[1].y = pos.y;
        line.geometry.verticesNeedUpdate = true;

        if(text !== undefined)
          cadCanvas.scene.remove(text);

        cadCanvas.render();

      }, false);

      canvas.addEventListener("mousemove", function(e){
        if(clickedPos !== undefined){

            var pos = cadCanvas.project(e.pageX, e.pageY);
            line.geometry.vertices[1].x = pos.x;
            line.geometry.vertices[1].y = pos.y;
            line.geometry.verticesNeedUpdate = true;

            var dist = line.geometry.vertices[0].distanceTo(line.geometry.vertices[1])*0.1;
            dist = Math.round(dist * 100)/100;

            if(text !== undefined)
              cadCanvas.scene.remove(text);
            var geometry = new THREE.TextGeometry(''+dist+" cm", { font: font, height: 0, size: 12 });
            geometry.dynamic = true;
            var material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            text = new THREE.Mesh(geometry, material);

            text.position.x = (line.geometry.vertices[0].x + line.geometry.vertices[1].x)/2;
            text.position.y = (line.geometry.vertices[0].y + line.geometry.vertices[1].y)/2;
            text.position.z = 0;

            cadCanvas.scene.add(text);

            cadCanvas.render();
        }
      });
      canvas.addEventListener("mouseup", function(e){
        if(clickedPos !== undefined){
          clickedPos = undefined
          cadCanvas.scene.remove(line);
          cadCanvas.scene.remove(text);
          cadCanvas.render();
        }
      });
    })(cadCanvas, font);
  }

}
