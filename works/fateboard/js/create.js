baidu(function(){
    baidu('#btn-start').click( function(){ 
        var width  = +baidu('#map-size-x').val();
        var height = +baidu('#map-size-y').val();

        baidu('#board').empty();
        var board = new Board( );
        var x, y, data = new Array();
        for( y = 0; y < height; y++) {
            data[y] =[];         
            for( x = 0; x < width; x++ ) {
                data[y][x] = 0
            }
        }
        board.setData(data);
        board.renderTo('#board').createMode();
        baidu('#board').click(function(){
            var data = board.getData();
            var rows = [];
            for( var y = 0; y < height; y++ ) {
                rows.push ('[' + data[y].join(', ') + ']');
            }
            baidu('#map-data').text('[' + rows.join(',\n') + ']');
        }).click();
    });
    
});
