// :: Celadon Underground Map ::
//

var celadon = {}

celadon.app = {

  selectState: function(stateID){
    $("#mapa-container").addClass("panel-opened")
    $("#menu-container").addClass("panel-opened")

    var data = celadon.data.estados[stateID]
    $(".block-title .chapeu").html("Senadores do estado " + data["Prep"])
    $(".block-title .estado").html(data["Estado"])
    $(".stats #pop").html(numberWithCommas(data["Pop"]))
    $(".stats #capital").html(data["Capital"])

    var senadores = []

    for (i in celadon.data.senadores) {
      var senador = celadon.data.senadores[i]
      if(senador.Estado == stateID){

        senadores.push(senador)
        var order = senadores.length
        var baseURL = "http://www.senado.gov.br/senadores/img/fotos-oficiais/senador"
        $("#spic"+ order).attr('celadon-id', senador.ID);
        $("#spic"+ order).attr('celadon-order', order);
        $("#spic"+ order).attr('src', '');
        $("#spic"+ order).attr('src', baseURL+senador.ID+'.jpg')

        $("#spic"+ senadores.length).unbind('click').click(function(){
          var id = $(this).attr('celadon-id');
          celadon.app.selectSenador(id)
        })

      }
    }
  },

  unselectAllSenadores: function(){
    $(".senadores .selected").removeClass("selected")
  },

  selectSenador: function(idSenador){
    for (i in celadon.data.senadores) {
      var senador = celadon.data.senadores[i]
      if(senador.ID == idSenador){

        $(".senadores .selected").removeClass("selected")
        $("[celadon-id="+senador.ID+"]").addClass("selected")

        var order =  $(".senadores .selected").attr("celadon-order")
        $(".senadores .selected").css("selected")
        $(".block-data .senador").html(senador.Nome)
        $(".block-data .chapeu").html(senador.Tratamento)

        switch (parseInt(order)) {
          case 1:
            $(".arrow-up").css('margin-left','calc(26% - 25px)'); break;
          case 2:
            $(".arrow-up").css('margin-left','calc(50% - 15px)'); break;
          case 3:
            $(".arrow-up").css('margin-left','calc(78% - 25px)'); break;
          default: break;
        }

        // Gastos

        for( s in celadon.data.gastos ){
          if ( celadon.data.gastos[s].ID == idSenador){

              var valores = []
              var registroDeGastos  = celadon.data.gastos[s]

              for( ref in celadon.data.referenciaDeGastos){

                var gasto = {}

                var totalGastoPorRef = 0// media 46.281,61  max 186.758
                var totalCount       = 0
                var maxGasto         = -1

                for (g in celadon.data.gastos) {
                  if(celadon.data.gastos[g][ref] != null){
                    var v = celadon.data.gastos[g][ref]
                    totalGastoPorRef += v
                    totalCount += 1
                    if(maxGasto < v) maxGasto = v
                  }
                }

                var mediaGasta = totalGastoPorRef/totalCount

                gasto.max   = maxGasto
                gasto.media = mediaGasta
                gasto.desc  = celadon.data.referenciaDeGastos[ref]
                gasto.valor = registroDeGastos[ref]
                valores.push(gasto);

              }

              valores.sort(function(a,b){
                return b.valor - a.valor
              })

              for (var i = 0; i < 3; i++) {
                var item = valores[i];

                var tamanhoDaMedia = (30 + (0.7 * (item.media / item.max)) * 100) + "%"
                var tamanhoDaDesse = (30 + (0.7 * (item.valor / item.max)) * 100) + "%"

                $(".gasto.top"+(i+1)+" .em2016").css("width", tamanhoDaDesse)
                $(".gasto.top"+(i+1)+" .media").css("width", tamanhoDaMedia)

                $(".gasto.top"+(i+1)+" .em2016").html(formatReal(item.valor))
                $(".gasto.top"+(i+1)+" .label").html(item.desc)

              }

              for(index in celadon.data.atividades){
                var atividade = celadon.data.atividades[index]
                if(atividade.ID == idSenador) {

                  var total = 0
                  total += atividade.Pronunciamentos
                  total += atividade.Proposicoes
                  total += atividade.Relatadas

                  var tier1 = 471 * (atividade.Pronunciamentos/total + atividade.Proposicoes/total)
                  var tier2 = 471 * (atividade.Proposicoes/total)

                  $(".pie.tier1").css("stroke-dasharray", tier1 + " 10000")
                  $(".pie.tier2").css("stroke-dasharray", tier2 + " 10000")

                  $(".info .tier2").html(atividade.Proposicoes)
                  $(".info .tier1").html(atividade.Pronunciamentos)
                  $(".info .tier0").html(atividade.Relatadas)
                }
              }

              var words = ["Hello", "world", "normally", "you", "want", "more", "words", "than", "this"]

              var listaInteresses = {}
              for (i in celadon.data.interesses) {
                  let data = celadon.data.interesses[i]
                  if (data.ID == idSenador) {
                      let words = data.Palavras.split(",")
                      for(j in words){
                        var word = words[j].trim()
                        if( listaInteresses[word] != null ){
                            listaInteresses[word] += 2
                        }else{
                            listaInteresses[word] = 2
                        }
                      }
                  }
              }

              var pesos = []
              for(i in listaInteresses){
                pesos.push({
                  "text": i,
                  "size": listaInteresses[i] * 5
                })
              }

              $("#world-cloud").html("")
              showWords('#world-cloud', pesos)
          }
        }

        $(".block-data").removeClass("transparent")
      }
    }
  }

}


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

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatReal(valor){

  if (valor > 1000) {
      return "R$ "+parseInt(valor/1000)+"mil"
  }else{
      return "R$ "+parseInt(valor)
  }


  var int = parseInt(valor*100)
  var tmp = int+'';
  tmp = tmp.replace(/([0-9]{2})$/g, ",$1");
  if( tmp.length > 6 ){
    tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
  }
  return "R$ "+tmp;
}
