function Board(  ) {

    function Map( width, height ) {
        var width , height;
        function hash(x, y) {
            return x + ',' + y;
        }
        var map_data = {};
        var TYPE_NAME = Map.TYPE_NAME = [ 'Road', 'Techird', 'Sue', '+7', '-5', '*3', '/2', 'Wall' ];
        var me = this;
        this.setCell = function( x, y, type ) {
            function updateDomClass( x, y, $dom, type, affect_cell ) {
                if( $dom == undefined ) {
                    var cell = me.getCell( x, y );
                    if ( cell == undefined ) return;
                    $dom = cell.dom;
                    type = cell.type;
                }
                $dom.removeClass('left')
                    .removeClass('right')
                    .removeClass('top')
                    .removeClass('bottom');
                
                if( x == 0 || me.getCellTypeName( x - 1, y ) == 'Wall' ) 
                    $dom.addClass('left');
                if( y == 0 || me.getCellTypeName( x, y - 1 ) == 'Wall' ) 
                    $dom.addClass('top');
                if( x == width - 1 || me.getCellTypeName( x + 1, y ) == 'Wall' ) 
                    $dom.addClass('right');
                if( y == height - 1 || me.getCellTypeName( x, y + 1 ) == 'Wall' ) 
                    $dom.addClass('bottom');

                if( affect_cell == undefined ) {
                    if( x > 0 ) updateDomClass( x - 1, y, undefined, undefined, true );
                    if( y > 0 ) updateDomClass( x, y - 1, undefined, undefined, true );
                    if( x < width ) updateDomClass( x + 1, y, undefined, undefined, true );
                    if( y < height ) updateDomClass( x, y + 1, undefined, undefined, true );
                }
            }
            function addCell( x, y, type ) {
                var $dom = baidu('<td>');
                $dom.addClass('board-cell')
                    .addClass('cell-type-' + type)
                    .attr('x', x)
                    .attr('y', y);
                updateDomClass( x, y, $dom, type );                
                return map_data[hash(x,y)] = {
                    type: type,
                    dom: $dom
                };
            }
            function changeCell( x, y, type ){
                var data = map_data[hash(x, y)];
                data.dom.removeClass('cell-type-' + data.type).addClass('cell-type-' + type);
                data.type = type;
                updateDomClass( x, y, data.dom, type );
                return data;
            }
            return this.getCell( x, y ) ? changeCell( x, y, type ) : addCell( x, y, type );
        }
        this.getCell = function( x, y ) {
            return map_data[hash(x, y)];
        }
        this.getCellType = function( x, y ) {
            var cell = this.getCell( x, y );
            return cell && cell.type;
        }
        this.getCellTypeName = function( x, y ) {
            var type = this.getCellType( x, y );
            return type !== undefined && TYPE_NAME[ type ];
        }
        this.setCellTypeName = function( x, y, name ) {
            this.setCell( x, y, TYPE_NAME.indexOf( name ) );
        }
        this.getCellDom = function( x, y ) {
            var cell = this.getCell( x, y );
            return cell && cell.dom;
        }
        this.load = function( data_array ) {
            var x, y;
            height = data_array.length;
            width  = data_array[0].length;
            for( y = 0; y < height; y++ ){
                for( x = 0; x < width; x++ ){
                    this.setCell( x, y, data_array[y][x] );
                }
            }
        }
        this.toArray = function() {
            var arr = [], x, y;
            for( y = 0; y < height; y++) {
                arr[y] = [];
                for( x = 0; x < width; x++ ) {
                    arr[y][x] = this.getCellType( x, y );
                }
            }
            return arr;
        }
        this.getSize = function(){
            return {
                width: width,
                height: height
            }
        }
    }    

    var MOVE_MAP = { 
        UP    : { x:  0, y: -1 }, 
        RIGHT : { x:  1, y:  0 }, 
        DOWN  : { x:  0, y:  1 },
        LEFT  : { x: -1, y:  0 }
    }; 
    var me     = this;
    var map    = new Map();
    var player = [];

    function reset() {
        player = [];
        player.push({
            name: 'Techird',
            position: null,
            value: 100,
            ai: undefined
        });

        player.push({
            name: 'Sue',
            position: null,
            value: 100,
            ai: undefined
        });

        var size = map.getSize();
        for( var y = 0; y < size.height; y++) 
        for ( var x = 0; x < size.width; x++ ) {
            var i = ['Techird', 'Sue'].indexOf( map.getCellTypeName( x, y ) );
            if( i == 0 || i == 1 ) {
                if ( player[i].position ) throw new Error( '重复的 ' + player[i].name + ' 位置');
                else player[i].position = { x: x, y: y };
            }
        }
        baidu('.board-cell').empty(); 
        lastCoveredPlayer = undefined;
        timerId = undefined;
        turn = 0;
        current_steps = undefined;
    }

    function render() {
        var $table = baidu('<table></table>').addClass('board-table');
        var size = map.getSize();
        for( var y = 0; y < size.height; y++) {
            var $tr = baidu('<tr>').appendTo($table);
            for ( var x = 0; x <size.width; x++ ) {
                var type = map.getCellType( x, y ) || Map.TYPE_NAME.indexOf('Road');
                $tr.append( map.setCell( x, y, type ).dom );
            }
        }
        reset();
        return $table;
    }

    function inRange( pos ) {
        var size = map.getSize();
        return pos.x >=0 && pos.x < size.width
            && pos.y >=0 && pos.y < size.height;
    }

    function afterMove( pos, mov ) {
        return {
            x: pos.x + mov.x,
            y: pos.y + mov.y
        };
    }

    var turn = 0, current_steps;

    function avalibleSteps( pos, current_value ) {              
        function moveTo( pos, mov, value ) {
            var value = value || 0;
            var pos = afterMove( pos, mov );

            if(! inRange( pos )) return null;

            var type = map.getCellTypeName( pos.x, pos.y );
            switch( type ) {
                case 'Road':
                case 'Techird':
                case 'Sue':
                    return { value: value - 1, pos: pos };
                case '+7':
                    return moveTo( pos, mov, value + 7 + 1 );
                case '-5':
                    return moveTo( pos, mov, value - 5 + 1 );
                case '*3':
                    return moveTo( pos, mov, value * 3 + 1 );
                case '/2':
                    return moveTo( pos, mov, (value >> 1) + 1 );
            }
            return null;
        }
        var steps = [];
        baidu.forEach( MOVE_MAP, function( mov, dir ) {
            var step = moveTo( pos, mov, current_value );
            if( step ) steps.push({
                direction: dir,
                position: step.pos,
                value: step.value
            });
        });
        return steps;
    }

    var timerId, timer = 500;
    var cbBeforeStep = baidu.Callbacks();
    function run() {
        var p = player[turn];
        var steps = avalibleSteps( p.position, p.value );
        current_steps = {};
        baidu.forEach( steps, function( step ) {
            var s = current_steps[step.direction] = {
                pos: step.position,
                val: step.value
            };
            var $dom = map.getCellDom( s.pos.x, s.pos.y );
            $dom.html( '<div class="step-value" direction="' + step.direction + '">' + s.val + '</div>' );
        });
        map.setCellTypeName( p.position.x, p.position.y, p.name );
        map.getCellDom( p.position.x, p.position.y ).addClass('active');


        cbBeforeStep.fireWith( me, [turn] );
        timerId = setTimeout(function(){                
            var ai = p.ai || keyboardAi;
            ai.call( me, steps, turn );
        }, timer );
        return expose;
    }

    function equalPos( pos1, pos2 ) {
        return pos1.x == pos2.x && pos1.y == pos2.y;
    } 

    var lastCoveredPlayer = undefined;
    var cbAfterStep = baidu.Callbacks();
    var cbSuccess = baidu.Callbacks();

    me.chooseStep = function( step ) {
        var choosen = typeof step == 'string' ? current_steps[step] : current_steps[step.direction];
        if(!choosen) throw new Error('Invalid Step!');

        var i = turn;
        var j = [1, 0][i];
        var src = player[i].position, 
            dst = choosen.pos;

        // 恢复原貌
        if ( lastCoveredPlayer ) {
            map.setCellTypeName( src.x, src.y, lastCoveredPlayer.name );
            lastCoveredPlayer = undefined;
        } else {
            map.setCellTypeName( src.x, src.y, 'Road' );
        }
        map.getCellDom( src.x, src.y ).removeClass('active');

        // 计算玩家新数据
        player[i].value = choosen.val;
        player[i].position = dst;
        map.setCellTypeName( dst.x, dst.y, player[i].name );

        if( equalPos( player[i].position, player[j].position ) ) {
            if( player[i].value == player[j].value ) {
                baidu('.board-cell').empty();
                cbSuccess.fireWith( me, [player[i], player[j]] );
                return;
            }
            else {
                // player[j] 被覆盖
                lastCoveredPlayer = player[j];
            }
        } 
        turn = j;
        baidu.forEach( current_steps, function( s ) {
            var $dom = map.getCellDom( s.pos.x, s.pos.y );
            $dom.html("");
        });
        cbAfterStep.fireWith( me );
        timerId = setTimeout(run, timer);
    }

    me.getPlayerInfo = function ( i ) {
        return baidu.object.clone( player[i] );
    }
    me.getMapType = function(x, y) {
        return map.getCellTypeName();
    }
    me.getMapSize = function(){
        return map.getSize();
    }

    var container;
    var expose = {
        renderTo: function( selector, callback ) {
            var $table = render();
            container = selector;
            $table.appendTo( container );
            if( baidu.type(callback) == 'function' ) callback.call( me, me, $table );
            return expose;
        },
        createMode: function( ) {
            var currentType = 0,
                active = {},
                length = Map.TYPE_NAME.length;
            baidu(container)
            .delegate('.board-cell', 'click', function( e ){
                if( active.acceptType != currentType ) {
                    active.acceptType = currentType;
                } else {
                    currentType = ( currentType + 1 ) % length;
                    active.acceptType = currentType;
                }
                map.setCell( active.x, active.y, active.acceptType );
            }).delegate('.board-cell', 'mouseenter', function( e ) {
                var target  = e.target,
                    $target = baidu(target),
                    x = +$target.attr('x'),
                    y = +$target.attr('y');
                    active.x = x;
                    active.y = y;
                    active.acceptType = map.getCellType( x, y );
                    map.setCell( x, y, currentType );
            }).delegate('.board-cell', 'mouseleave', function( e ) {
                map.setCell( active.x, active.y, active.acceptType );
            } );
            return expose;
        },
        getData: function() {
            return map.toArray();
        },
        setData: function(data) {
            map.load(data);
            return expose;
        },
        setPlayerAi: function( i, fn ){
            player[i].ai = fn;
            return expose;
        },
        getPlayerInfo: me.getPlayerInfo,
        beforeStep: function ( fn ) {
            cbBeforeStep.add( fn );
            return expose;
        },
        afterStep: function( fn ) {
            cbAfterStep.add( fn );
            return expose;
        },
        success: function( fn ) {
            cbSuccess.add(fn);
            return expose;
        },
        run: run,
        stop: function( ) {
            clearTimeout(timerId);
            return expose;
        },
        setTimer: function( value ){
            timer = value;
            return expose;
        },
        reset: reset
    }
    return expose;
}