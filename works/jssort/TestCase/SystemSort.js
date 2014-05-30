function cmp (a, b) {
    return a - b;
}

addCase( {
    id: 'SystemSort',
    name: '系统sort方法',
    run: function () {
        var arr = [2,55,55,1,75,3,9,35,70,166,432,678,32,98] ;
        arr.sort( cmp );                                    
    },
    repeat: 300000
} );
