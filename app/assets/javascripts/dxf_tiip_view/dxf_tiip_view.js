'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Array.prototype.clear = function () {
  while (this.length) {
    this.pop();
  }
};

function createTable(keyValue) {
  var $table = $('<table class="table"></table>');
  var $th = $('<tr></tr>');
  var $td = $('<tr></tr>');

  $table.append($th);
  $table.append($td);
  $("#metadata").append($table);

  for (var iii = 0; iii < keyValue.length; iii++) {
    var e = keyValue[iii];

    $th.append($('<th>' + e[0] + '</th>'));
    $td.append($('<td>' + e[1] + '</td>'));
  }
  return $table;
}

var Entity = function () {
  function Entity(entity, block, view) {
    _classCallCheck(this, Entity);

    this.entity = entity;
    this.block = block;
    this.view = view;

    this.texts = [];
    this.textsWithoutComment = [];

    for (var iii = 0; iii < block.entities.length; iii++) {
      var block_entity = block.entities[iii];
      if (block_entity.type == "TEXT") {
        {
          var _block_entity$text$sp = block_entity.text.split(':'),
              _block_entity$text$sp2 = _slicedToArray(_block_entity$text$sp, 2),
              k = _block_entity$text$sp2[0],
              v = _block_entity$text$sp2[1];

          v = v.replace(' ', '');
          this.texts.push([k, v]);
        }
        if (block_entity.text.indexOf("COMMENT") >= 0) {
          block_entity.text = block_entity.text.split(':')[1];
          // block_entity.startPoint = {x:0,y:0,z:0};
        } else {
          var _block_entity$text$sp3 = block_entity.text.split(':'),
              _block_entity$text$sp4 = _slicedToArray(_block_entity$text$sp3, 2),
              k = _block_entity$text$sp4[0],
              v = _block_entity$text$sp4[1];

          v = v.replace(' ', '');
          block_entity.text = "";
          this[k.toLowerCase()] = v;
          this.textsWithoutComment.push([k, v]);
        }
      }
    }
  }

  _createClass(Entity, [{
    key: 'setVisible',
    value: function setVisible(b) {
      this.entity.object.visible = b;
    }
  }, {
    key: 'createCheckbox',
    value: function createCheckbox() {

      var entity = this.entity;
      var block = this.block;

      var name = this.entity.name;

      var card = $('<div class="card"></div>');
      var card_header = $('<div class="card-header" role="tab" id="heading-' + name + '"></div>');
      var card_header_a = $('<a data-toggle="collapse" data-parent="#accordion" href="#collapse-' + name + '"' + ' aria-expanded="true" aria-controls="collapse-' + name + '">' + '<i class="ion-arrow-right-b"></i> ' + '</a>');
      var card_block = $('<div id="collapse-' + name + '" class="collapse" role="tabpanel" aria-labelledby="heading-' + name + '">' + '<div class="card-block">' + '</div></div>');

      card.append(card_header);
      card_header.append(card_header_a);
      card.append(card_block);

      var checkbox = $('<input type="checkbox" id="' + name + '" checked/> ' + '<label for="' + name + '">' + name + '<span class="piece-name">' + this.piece + '</span></label>');
      card_header.append(checkbox);

      var focus = $(' <i class="ion-qr-scanner card-tool"></i>');
      card_header.append(focus);

      var entity = this;
      checkbox.change(function () {
        if ($(this).is(':checked')) {
          entity.setVisible(true);
          entity.view.render();

          // self.cadCanvas.focus(self.entities[0].entity.object);
        } else {
          entity.setVisible(false);
          entity.view.render();
        }
      });

      focus.click(function () {
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
  }]);

  return Entity;
}();

var DxfTiipView = function () {
  _createClass(DxfTiipView, null, [{
    key: 'set',
    value: function set(selector, htmlfilepath) {
      var url = $(selector).attr('url');

      var $target = $(selector);
      $target.click(open);

      function open() {
        var features = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
        var win = window.open(htmlfilepath + "?url=" + url, "DXF TIIP View", features);
      }
    }
  }]);

  function DxfTiipView() {
    _classCallCheck(this, DxfTiipView);

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

  _createClass(DxfTiipView, [{
    key: 'load',
    value: function load(url, data, font_path) {

      this.font_path = font_path;

      var self = this;
      $.ajax({
        type: "POST",
        beforeSend: function beforeSend(xhr) {
          xhr.overrideMimeType('text/plane;charset=Shift_JIS');
        },
        url: url,
        data: data,
        async: true,
        success: function success(data) {
          self.loadDxf(data);
        }
      });
    }
  }, {
    key: 'loadDxf',
    value: function loadDxf(data) {
      //
      var parser = new window.DxfParser();
      this.dxf = parser.parseSync(data);
      console.log(this.dxf);

      this.loadMetadata(this.dxf);
      this.updateEntities(this.dxf);
      this.createCheckboxes(this.dxf);
      this.drawThreeDxf();
    }
  }, {
    key: 'loadMetadata',
    value: function loadMetadata(dxf) {
      $("#metadata").empty();
      var es = dxf.entities;

      var keyValue = [];
      for (var iii = 0; iii < es.length; iii++) {
        var e = es[iii];
        if (e.type == "TEXT") {
          var ss = e.text.split(':');
          keyValue.push([ss[0], ss[1]]);
        }
      }
      $("#metadata").append(createTable(keyValue));
    }
  }, {
    key: 'createCheckboxes',
    value: function createCheckboxes(dxf) {
      $("#checkboxes").empty();
      var accordion = $('<div id="accordion" role="tablist" aria-multiselectable="true"></div>');
      $("#checkboxes").append(accordion);

      for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        var cb = entity.createCheckbox();
        accordion.append(cb);
      }
    }
  }, {
    key: 'updateEntities',
    value: function updateEntities(dxf) {

      if (dxf == null) return;

      this.entities.clear();

      var dd = $.extend(true, {}, dxf);
      this.data = dd;

      for (var i = 0; i < dd.entities.length; i++) {
        var entity = dd.entities[i];

        if (entity.name !== undefined) {
          var block = dd.blocks[entity.name];

          var entityObj = new Entity(entity, block, this);
          this.entities.push(entityObj);
        }
      }
    }
  }, {
    key: 'drawThreeDxf',
    value: function drawThreeDxf() {
      var data = this.data;
      // Three.js changed the way fonts are loaded, and now we need to use FontLoader to load a font
      //  and enable TextGeometry. See this example http://threejs.org/examples/?q=text#webgl_geometry_text
      //  and this discussion https://github.com/mrdoob/three.js/issues/7398
      var loader = new THREE.FontLoader();

      var self = this;

      loader.load(this.font_path, function (response) {
        self.font = response;
        var elem = document.getElementById('cad-view');

        //remove all elements
        while (elem.firstChild) {
          elem.removeChild(elem.firstChild);
        } //remove all listeners
        var new_element = elem.cloneNode(true);
        elem.parentNode.replaceChild(new_element, elem);

        var w = $("#cad-view").parent().width();
        self.cadCanvas = new ThreeDxf.Viewer(data, document.getElementById('cad-view'), w, w, self.font);
        self.addMeasuringFunction(self.cadCanvas, self.font);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.cadCanvas !== undefined) {
        this.cadCanvas.render();
      }
    }
  }, {
    key: 'addMeasuringFunction',
    value: function addMeasuringFunction(cadCanvas, font) {
      (function () {
        var text = undefined;
        var line = undefined;
        var clickedPos = undefined;
        var canvas = document.getElementById('cad-view');
        canvas.addEventListener("mousedown", function (e) {

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

          if (text !== undefined) cadCanvas.scene.remove(text);

          cadCanvas.render();
        }, false);

        canvas.addEventListener("mousemove", function (e) {
          if (clickedPos !== undefined) {

            var pos = cadCanvas.project(e.pageX, e.pageY);
            line.geometry.vertices[1].x = pos.x;
            line.geometry.vertices[1].y = pos.y;
            line.geometry.verticesNeedUpdate = true;

            var dist = line.geometry.vertices[0].distanceTo(line.geometry.vertices[1]) * 0.1;
            dist = Math.round(dist * 100) / 100;

            if (text !== undefined) cadCanvas.scene.remove(text);
            var geometry = new THREE.TextGeometry('' + dist + " cm", { font: font, height: 0, size: 12 });
            geometry.dynamic = true;
            var material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            text = new THREE.Mesh(geometry, material);

            text.position.x = (line.geometry.vertices[0].x + line.geometry.vertices[1].x) / 2;
            text.position.y = (line.geometry.vertices[0].y + line.geometry.vertices[1].y) / 2;
            text.position.z = 0;

            cadCanvas.scene.add(text);

            cadCanvas.render();
          }
        });
        canvas.addEventListener("mouseup", function (e) {
          if (clickedPos !== undefined) {
            clickedPos = undefined;
            cadCanvas.scene.remove(line);
            cadCanvas.scene.remove(text);
            cadCanvas.render();
          }
        });
      })(cadCanvas, font);
    }
  }]);

  return DxfTiipView;
}();