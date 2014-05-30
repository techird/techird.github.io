window.ai_map = {};

ai_map['manualControlAi'] = {
    name: '手动控制',
    implement: function manualControlAi ( steps, turn ) {
        var board = this;
        function choose( dir ) {
            baidu.forEach( steps, function(step){
                if(step.direction == dir ) {
                    board.chooseStep( step );
                }
            });
        }
        function onKeydown( e ){
            var dir = ({'37':'LEFT','38':'UP', '39': 'RIGHT','40': 'DOWN'})[ e.keyCode.toString() ];
            choose( dir );
        }
        function onClick( e ) {
            var dir  = baidu(e.target).attr('direction');
            choose( dir );
        }
        function bind() {
            baidu(window).on( 'keydown', onKeydown);
            baidu('.board-cell div.step-value').on( 'click', onClick );
        }
        function unbound() {    
            baidu(window).off('keydown', onKeydown);
            baidu('.board-cell div.step-value').off('click', onClick);
        }
        bind();
    }
};

ai_map['randomAi'] = {
    name: '随机走法',
    implement: function randomAi ( steps, turn ) {
        this.chooseStep(steps[ Math.floor(Math.random() * 100 ) % steps.length ]);
    }
};

ai_map['greedyAi'] = {
    name: '贪心突变走法',
    implement: function greedyAi ( steps, turn ) {
        var you = this.getPlayerInfo( [1,0][turn] );
        var minDiff = Number.MAX_VALUE;
        var choosen = undefined;

        // 产生突变，以免死循环
        if( Math.random() > 0.618 ) {
            choosen = steps[ Math.floor(Math.random() * 100 ) % steps.length ];
        } else {
            baidu.forEach( steps, function(step){
                var diff = Math.abs(you.value - step.value)
                if( diff < minDiff ) {
                    minDiff = diff;
                    choosen = step;
                }
            } );
        }

        this.chooseStep(choosen);
    },
    isDefault: true
};

ai_map['customAi'] = {
    name: '我自己写',
    implement: function customAi ( steps, turn ) {
        // steps - 可以选择的走法，对于每一个走法：
        //   step.direction - 走步的方向，取值为 'UP' / 'DOWN' / 'LEFT' / 'RIGHT'
        //   step.position - 到达的位置上
        //   step.value    - 到达后的值

        // turn - 当前走的玩家，为1或0

        // this.getPlayerInfo( i ) - 获得玩家i的信息，返回值有：
        //   player.position - 玩家当前位置
        //   player.name     - 玩家的名称
        //   player.value    - 玩家的值

        // this.getMapType( x, y ) - 获得在 (x, y) 处的地图类型，
        //   可能的取值：[ 'Road', 'Techird', 'Sue', '+7', '-5', '*3', '/2' ];

        // this.getMapSize() - 获得地图的大小
        //   size.width - 地图的宽
        //   size.height - 地图的高

        // chooseStep(step||step.direction) - 决定走法后，使用该函数触发
    }
};