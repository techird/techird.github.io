# coding=utf-8
'''
    @author:    Techird
    @copyright: 自由使用，但保留作者名称
    @changelog: 
        2012/11/26 代码从 .Net 的实现中迁移过来
'''
def FindMatchBracket ( text, start_point ):
    ''' @description:
        查找 JavaScript 中匹配的右括号
        已处理的情况：
            1. 能忽略注释中的右括号
            2. 能忽略字符串中的右括号
            3. 能忽略正则表达式中的右括号
        
        @param      text        {String}   用于查找的字符串
        @param      start_point {Integer}  左括号位置，该位置字符必须是“{”、“(”或“[”之一
        @return                 {Integer}  如果发现配对的右括号，返回其字符索引；如果start_point非法或没找到，返回 -1
    '''
    def IsWordChar ( c ):
        return c >= '0' and c <= '9' or \
               c >= 'a' and c <= 'z' or \
               c >= 'A' and c <= 'Z' or \
               c == '_' or  c == '$'

    def IsSpaceChar ( c ):
        return c == ' ' or c == '\t' or c == '\n' or c == '\r' 

    demiter_start = text[start_point]
    demiter_end   = None
    mode_demiter  = None
    mode          = 'Normal'
    deep          = 0
    i             = start_point
    j             = None
    length        = len( text )

    if ( demiter_start == '{' ): 
        demiter_end = '}'
    elif ( demiter_start == '(' ): 
        demiter_end = ')'
    elif ( demiter_start == '[' ):
        demiter_end = ']'
    else:
        return -1

    while ( i < length ):
        ch = text[i]

        #TextMode: Normal, String, Regex, Comment
        if ( mode == 'Normal' ):
            #print('[N]%s ' % ch )
            # 识别字符串开始
            if ( ch == "\'" or ch == '"' ):
                mode = 'String'
                mode_demiter = ch
                i += 1
                continue

            # 识别正则或注释的开始
            elif (ch == '/'):
                fwd = text [ i + 1 ]
                # 识别注释
                if ( fwd == '/' or fwd == '*' ):
                    mode = 'Comment'
                    mode_demiter = fwd
                    i += 2
                    continue
                
                # 作为除法使用
                j = i - 1
                while ( IsSpaceChar( text[j] ) ): j -= 1
                if ( IsWordChar( text[j] ) or text[j] == ')' ):
                    i += 1
                    continue

                # 其他情况认为是正则表达式
                mode = 'Regex'
                i += 1
                continue
            
            # 合法的括号匹配
            else:
                if ( ch == demiter_start ): 
                    deep += 1
                    #print('deep = %d' % deep)
                elif ( ch == demiter_end ):
                    deep -= 1
                    #print('deep = %d' % deep)
                if ( deep == 0 ):
                    return i
                i += 1
                continue

        elif ( mode == 'String' ):
            #print('[S]%s ' % ch )
            # 忽略转义字符
            if ( ch == '\\' ):
                i += 2
                continue

            # 字符串结束
            elif ( ch == mode_demiter ):
                mode = 'Normal'
                i += 1
                continue

            # 字符串没结束
            else:
                i += 1
                continue

        elif ( mode == 'Comment' ):
            #print('[C]%s ' % ch )
            # 单行注释到\n结束
            if ( mode_demiter == '/' and ch == '\n' ):
                mode = 'Normal'
                i += 1
                continue

            # 多行注释需要往后看一个
            elif ( mode_demiter == '*' and ch == '*' and text [ i + 1 ] == '/' ):
                mode = 'Normal'
                i += 2
                continue

            # 注释还没有结束
            else:
                i += 1
                continue

        elif ( mode == 'Regex' ):
            #print('[R]%s ' % ch)
            # 忽略转义字符
            if ( ch == '\\' ):
                i += 2
                continue

            # 正则结束
            elif ( ch == '/' ):
                mode = 'Normal'
                i += 1
                continue

            # 正则没有结束
            else:
                i += 1
                continue
        #end if mode state machine

    #end while

    return -1
#end FindMatchBracket

'''print(FindMatchBracket ( '{//start\n' + \
                    '   var a = { b: c/3 d: (a+b)/c }\n' + \
                    '   var b = "this is a string with next line\\nnext line"' + \
                    '   var c = /text\\/\\/this/i\n' + \
                    '   /* inline comment {} /test/ */}', 0))
'''

#print(FindMatchBracket.__doc__)



