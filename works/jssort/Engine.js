/// <reference path="jQuery-1.7.2.min.js" />
/**
 * 性能测试引擎
 * @author Techird
 * @copyright 2012
 * 
 * @update 2012-07-13 完成基本计时功能
 * @update 2012-07-16 分时执行，留下空余时间让浏览器渲染进度
 */

( function ( window ) {

	/**
	 * 格式化字符串 format(format, param1, param2, ...)
	 * @example var message = String.format('Hello, {0}, time is {1} now.', name, new Date());
	 */
	String.format = function ( format, param ) {
		var args = arguments;
		var str = args[0];
		var param_pattern = /\{(\d+)\}/g;
		str = str.replace( param_pattern, function () {
			var param_index = arguments[1] * 1;     // arguments[1] 是(\d+)的结果
			return args[param_index + 1];
		} );
		return str;
	}



	/*计时器*/
	function Timer() {
		this._timeSpan = new Number( 0 );
		this._startTime = new Date();
		this._started = false;
		this._step = Number.POSITIVE_INFINITY;
	}
	Timer.prototype = {
		start: function () {
			this._started = true;
			this._startTime = +new Date();
		},
		pause: function () {
			if ( this._started ) {
				this._timeSpan += ( +new Date() - this._startTime );
			}
		},
		setStep: function ( step ) {
			this._step = step;
		},
		isOverStep: function () {
			return ( +new Date() - this._startTime ) >= this._step;
		},
		getResult: function () {
			return this._timeSpan;
		}
	};



	/*性能测试引擎*/
	var Engine = function () { }

	/* 每1次空调用花费的时间 */
	Engine._performanceFix = 0;

	Engine.prototype = {

		_isFunction: function ( unknown ) {
			return typeof unknown === 'function';
		},

		_logger: console,

		_log: function ( content ) {
			this._logger && ( this._logger.log( content ) );
		},

		_isRunning: false,

		_caseQueue: new Array(),

		_breaked: false,

		_run: function ( context, callback ) {
			var timer = new Timer();
			var fn = context.run,
				repeat = context.repeat,
				iRepeat = 0,
				update = context.update,
				me = this;

			// 每 10 ms 暂停让浏览器渲染dom
			timer.setStep( 10 );
			setTimeout( function () {

				timer.start();
				do {
					fn.call( context );
				} while ( iRepeat++ < repeat && !timer.isOverStep() );
				timer.pause();

				update && update.call( me, iRepeat, repeat, timer.getResult() - Engine._performanceFix * iRepeat );

				if ( !context._breaked && iRepeat < repeat ) {
					// 5 ms 用于浏览器渲染dom
					setTimeout( arguments.callee, 10 );
				} else {
					callback.call( me, timer.getResult() - Engine._performanceFix * repeat );
				}
			}, 5 );

		},

		/**
		 * 配置日志记录器，默认是console
		 * @param {object|fn} logger 给定一个包含log方法的对象或一个log方法
		 */
		setupLogger: function ( logger ) {
			this._isFunction( logger ) && ( logger = { log: logger } );
			logger && logger.log && ( this._logger = logger );
		},

		/**
		 * 执行一个运行实例
		 * 如果当前有实例在运行，将会把请求加入队列
		 * 
		 * @parma		{config}		context					配置
		 * @config		{string}		context.id				例程的id
		 * @config		{string}		context.description		例程的说明
		 * @config		{function}		context.init			运行前执行的初始化配置
		 * @config		{function}		context.fn				需要执行测试的函数，函数上下文是context参数
		 * @config		{number}		context.repeat			（可选）需要重复执行的次数，默认值为1
		 * @config		{function}		context.dispose			（可选）回收在init时使用的资源
		 *
		 * @return		{void}			没有返回值
		 */
		run: function ( context ) {

			// 加入队列
			context && this._caseQueue.push( context );

			if ( this._isRunning ) return;
			if ( !this._caseQueue.length ) {
				return;
			}

			this._isRunning = true;

			context = this._caseQueue.shift();


			// 测试名称
			var name = context.name || '未命名测试';

			// 初始化			
			this._isFunction( context.init ) && context.init.call( context );

			context.repeat = context.repeat || 1;
			this._log( String.format( "开始运行： {0} （重复 {1} 次）", name, context.repeat ) );

			// 开始计时执行
			this._run( context, function ( time ) {
				// 当前实例运行完成或被中断

				if ( this._breaked ) {
					this._log( String.format( "运行已中断，已用时间：{0} ms", time ) );
				} else {
					this._log( String.format( "运行完成，用时：{0} ms", time ) );
				}				

				// 通知完成
				!this._breaked && this._isFunction( context.finish ) && context.finish.call( context, time );

				// 回收资源
				this._isFunction( context.dispose ) && context.dispose.call( context );

				this._isRunning = false;

				if ( !this._breaked ) {
					this.run();
				} else {
					while ( this._caseQueue.length ) delete this._caseQueue.shift();
					this._breaked = false;
				}
			} );
		},

		/**
		 * 中断当前所有测试以及队列
		 */
		break: function () {
			return this._isRunning && ( this._breaked = true );
		},

		/**
		 * 测试空函数性能，运行后自动作为结果修正
		 * @param {Number} repeat 循环次数，越大越准确，默认值为 1,000,000 次
		 */
		runBenchmark: function ( update, repeat ) {
			repeat = repeat || 1e6;
			this.run( {
				name: '空函数测试（BenchMark）',
				init: function () {
					Engine._performanceFix = 0
				},
				run: function () { /*空函数*/ },
				update: update,
				repeat: repeat,
				finish: function ( time ) {
					Engine._performanceFix = time / repeat;
				}
			} );
		}
	};

	/**Expose*/
	window.Engine = Engine;

} )( window );