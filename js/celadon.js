// :: Celadon Underground Map ::
//

var celadon = {}

celadon.tpl = {

    precompiled_templates:{},

    insert: function(divId, templateName) {

      function display(){
    	   var tag = document.getElementById(divId);
		     tag.innerHTML = celadon.tpl.precompiled_templates[templateName]()
         nodeScriptReplace(tag);
		  }

		  if(celadon.tpl.precompiled_templates[templateName]){
	       display();
      }else{

		      var r = new XMLHttpRequest();
          var base = "tpls/";
          var loc = base + templateName + ".template.html";

          console.log("loading html template: " + loc);

          r.open("GET", loc, true);
          r.onreadystatechange = function () {
            if (r.readyState == 4 && r.status == 200){
              celadon.tpl.precompiled_templates[templateName] = Handlebars.compile(r.responseText);
              display();
            }
          };

          r.send();
		  }
    }
}




// From: http://stackoverflow.com/questions/1197575/can-scripts-be-inserted-with-innerhtml

function nodeScriptReplace(node) {
  if ( nodeScriptIs(node) === true ) {
    node.parentNode.replaceChild( nodeScriptClone(node) , node );
  } else {
    var i        = 0;
    var children = node.childNodes;
    while ( i < children.length ) {
      nodeScriptReplace( children[i++] );
    }
  }

  return node;
}

function nodeScriptIs(node) {
  return node.tagName === 'SCRIPT';
}

function nodeScriptClone(node){
  var script  = document.createElement("script");
  script.text = node.innerHTML;
  for( var i = node.attributes.length-1; i >= 0; i-- ) {
    script.setAttribute( node.attributes[i].name, node.attributes[i].value );
  }
  return script;
}
