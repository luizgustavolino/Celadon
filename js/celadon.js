// :: Celadon Underground Map ::
//

var celadon = {}

celadon.tpl = {

    precompiled_templates:{},

    insert: function(divId, templateName) {

      function display(){
    	   var tag = document.getElementById(divId);
		     tag.innerHTML = celadon.tpl.precompiled_templates[templateName]()
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
