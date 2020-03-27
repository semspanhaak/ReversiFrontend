Game.Reversi = (function () {
    console.log('hallo, vanuit module Reversi')

    //Configuratie en state waarden
    let _configMap = {
        apiPath: '/api/spel/',
        idOfGame: 0,
        colour: 0
    }

    // Private function init
    const _init = function (id, colour) {
        console.log("Game.Template starting...")
        _configMap.idOfGame = id
        _configMap.colour = colour
        getGameState(id)
    }

    const showFiche = function (kleur, y, x) {
        if(kleur == 0) {
            $('.' + 'div_' + x + '_' + y).removeClass("fiche-black");
            $('.' + 'div_' + x + '_' + y).removeClass("fiche-white");
            //$('.' + 'div_' + x + '_' + y).addClass("fiche-none");
        } else {
            $('.' + 'div_' + x + '_' + y).removeClass("fiche-black");
            $('.' + 'div_' + x + '_' + y).removeClass("fiche-white");

            var color = kleur == 1 ? 'white' : 'black';
            //$('.' + 'div_' + x + '_' + y).removeClass("fiche-none");
            $('.' + 'div_' + x + '_' + y).addClass("fiche-" + color);
        }
    }

    const clearBoard = function () {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                $('.' + 'div_' + i + '_' + j).removeClass("fiche-black");
                $('.' + 'div_' + i + '_' + j).removeClass("fiche-white");
            }
        }
    }

    const showQuote = function() {
        $('.quote-container').append(Game.Template.parseTemplate("quote", {
            quote: Game.Api.quote
        }))
    }

    const getGameState = function(id) {
        $.get(_configMap.apiPath + id)
        .then((data) => {
            let bord = data.bord
            for (let i = 0; i <= 7; i++) {
                for (let j = 0; j <= 7; j++) {
                    const element = bord[i][j];
                    showFiche(element, i, j)
                }   
            }

            let myColour = data.aanDeBeurd == 1 ? "Wit" : "Zwart"
            $(".game_statistics__aandebeurt").text(myColour)
            $(".game_statistics__round").text(data.beurt)
            
            updateChartData(data)
        })
    }

    const Move = function (y, x) {
        $.post(_configMap.apiPath + _configMap.idOfGame + "/" + y + "/" + x + "/" + _configMap.colour)
        .then((response) => {
            getGameState(_configMap.idOfGame)
        })
        
        // let data = {
        //     x: y,
        //     y: x,
        //     colour: _configMap.colour
        // }
        
        // postData(_configMap.apiPath + _configMap.idOfGame, data)
        // .then((data) => {
        //     console.log(data);
            
        //     getGameState(_configMap.idOfGame)
        // });
    }

    async function postData(url = '', data = {}) {
        const response = await fetch(url, {
          method: 'POST', 
          mode: 'cors', 
          cache: 'no-cache',
          credentials: 'same-origin', 
          headers: {
            'Content-Type': 'application/json'
            
          },
          redirect: 'follow', 
          referrerPolicy: 'no-referrer', 
          body: JSON.stringify(data) 
        });
        return await response.json(); 
      }

    const updateChartData = function(data) {
        // Get most fiches per colour
        Game.Stats.removeDataset("Aantal zwarte fiches")
        Game.Stats.removeDataset("Aantal witte fiches")
        Game.Stats.removeDataset("Totaal aantal fiches")

        let labelRoundArray = []
        for (let i = 0; i < data.amountOfBlack.length; i++) {
            labelRoundArray.push(i.toString())       
        }
        Game.Stats.setLabels(labelRoundArray)

        let totalFiches = []
        for (let i = 0; i < labelRoundArray.length; i++) {
            let fichesInRound = 0;

            fichesInRound+= data.amountOfBlack[i]
            fichesInRound+= data.amountOfWhite[i]
            totalFiches.push(fichesInRound.toString())

            fichesInRound = 0;
        }

        let dataOfTotal = {
            label: "Aantal totale fiches",
            data: totalFiches,
            backgroundColor: 'rgba(0, 0, 255, 0.1)'
        }
        Game.Stats.addDataset(dataOfTotal)

        let dataOfBlack = {
            label: "Aantal zwarte fiches",
            data: data.amountOfBlack,
            backgroundColor: 'rgba(0, 255, 255, 0.3)'
        }
        Game.Stats.addDataset(dataOfBlack)

        let dataOfWhite = {
            label: "Aantal witte fiches",
            data: data.amountOfWhite,
            backgroundColor: 'rgba(255, 0, 0, 0.3)'
        }
        Game.Stats.addDataset(dataOfWhite)
    }

    // Waarde/object geretourneerd aan de outer scope
    return {
        init: _init,
        showFiche: showFiche,
        clearBoard: clearBoard,
        showQuote: showQuote,
        getGameState: getGameState,
        Move: Move
    }
})()