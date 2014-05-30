//找到最小值在数组中的位置
function min_pos(s, v){
    for(k in s){
        if(s[k] == v){
            return k;
        }
    }
}


addCase( {
    id: 'MinSort',
    name: '选择排序',
    run: function () {
        var arr = [2,55,55,1,75,3,9,35,70,166,432,678,32,98];
        var len = arr.length;    
        var newarr = [];

        for(var i = 0; i<len; i++){
            newarr.push( Math.min.apply( null, arr ) );  //把最小值插入新数组
            arr.splice( min_pos( arr, Math.min.apply( null, arr ) ) , 1);  //插入后,立马删除最小值
        }
    },
    repeat: 300000
} );