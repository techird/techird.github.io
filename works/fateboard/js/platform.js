baidu.dom.extend({
    disable: function( val ) {
        if( val === undefined ) return this.attr('disabled') == 'disabled';
        if( val === true ) this.attr('disabled', 'disabled');
        if( val === false ) this.removeAttr('disabled');
    }
});

baidu(function(){
    var board = new Board();
    var map_data;
    var step_count = 0; 

    function buildAiSelect() {
        baidu.forEach( ai_map, function( ai, id ) {
            baidu('<option>').val(id).text(ai.name).appendTo('#player0-ai').attr('selected', ai.isDefault ? 'selected' : undefined);
            baidu('<option>').val(id).text(ai.name).appendTo('#player1-ai').attr('selected', ai.isDefault ? 'selected' : undefined);;
        });
        function onPlayerAiChange( e ) {
            var $select = baidu( e.target );
            var ai = ai_map[ $select.val() ];
            $select.nextAll('textarea').val( ai.implement.toString() );
        }
        baidu('#player0-ai, #player1-ai').click( onPlayerAiChange ).click();
    }

    function buildMapSelect() {
        baidu.forEach( maps, function( map, id ) {
            baidu('<option>').val(id).text(map.name).appendTo('#map-usage').attr('selected', map.isDefault ? 'selected' : undefined);;
        });
        function onMapChange( e ) {
            var $select = baidu( e.target );
            var map = maps[ $select.val() ];
            $select.nextAll('textarea').val( '[' + baidu.array( map.data ).map(function( line ){
                return '[' + line.join(', ') + ']';
            }).join(',\n') + ']' );
        }
        baidu('#map-usage').click( onMapChange ).click();
    }

    function handleStepping() {
        board.beforeStep( function ( i ) {
            var p = this.getPlayerInfo( i );
            baidu('#info').append('<p>等待 ' + p.name + ' 走子...</p>');
        });
        board.success( function( techird, sue ) {
            baidu('#info').empty().append('<p class="love">在两人走过 ' + step_count + ' 步之后，' + techird.name + ' 找到了 ' + sue.name + ', 在 ' + techird.value + ' 层相遇<p>');
        });
        board.afterStep( function() {
            var me = this;
            function printPlayerInfo(i){
                var p = me.getPlayerInfo(i);
                baidu('<p>').html( p.name + ': ( ' + p.position.x + ', ' + p.position.y + ', ' + p.value + ' )' ).appendTo('#info');
            }
            baidu('#info').empty();
            printPlayerInfo(0);
            printPlayerInfo(1);
            baidu('<p>').html('已走 ' + (++step_count) + ' 步').appendTo('#info');
        });
        function onStepSpeedChange( e ) {
            board.setTimer( +baidu('#step-speed').val() );
        }
        baidu('#step-speed').click( onStepSpeedChange ).click();
    }

    function handleAction() {
        function getPlayerAi( selector ) {
            try {
                return eval( '(' + baidu(selector).val() + ')' );
            } catch (e) {
                alert('AI 代码有错');
                baidu(selector).focus();
                throw e;
            }
        }

        function run() {
            if(baidu('#btn-run').disable()) return;
            baidu('#btn-run').disable(true);
            baidu('#btn-stop').disable(false)
            board.setPlayerAi( 0, getPlayerAi('#player0-ai-code') );
            board.setPlayerAi( 1, getPlayerAi('#player1-ai-code') );
            step_count = 0;
            board.run();
        }

        function stop() {
            if(baidu('#btn-stop').disable()) return;
            baidu('#btn-stop').disable(true);
            baidu('#btn-run').disable(false);
            board.stop();
            board.setData(map_data);
            board.reset();
            baidu('#info').empty();
        }

        function loadMap() {
            try {
                map_data = eval( '(' + baidu('#map-data').val() + ')' );
                board.stop();
                board.setData( map_data );
                board.renderTo( baidu('#board').empty() );
            } catch ( e ) {
                alert('地图数据有误');
            } 
        }   
        
        baidu('#btn-run').click( run );
        baidu('#btn-stop').click( stop );
        baidu('#btn-apply-map').click( loadMap ).click();
    }

    buildAiSelect();
    buildMapSelect();
    handleStepping();
    handleAction();
});