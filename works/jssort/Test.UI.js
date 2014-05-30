/// <reference path="Engine.js" />
/// <reference path="import.js" />

(function (window) {

	var engine = new Engine();

	var caseQueue = {};

	var elements = new (function () {
		this.divStatus = document.getElementById("status");
		this.btnRunAll = document.getElementById("btnRunAll");
		this.btnRunSelected = document.getElementById("btnRunSelected");
		this.btnCancel = document.getElementById("btnCancel");
		this.tblCase = document.getElementById("case-display").getElementsByTagName("table")[0];
	})();

	function setStatus(content) {
		var shortTime = new Date().toLocaleTimeString();
		elements.divStatus.innerHTML = String.format('<p><span class="log-time">[{0}]</span> {1}</p>', shortTime, content);
		console.log( String.format('[{0}] {1}', shortTime, content));
	}

	function addCaseToUI(runCase) {
		var checkbox = String.format('<input id="chk-' + runCase.id + '" class="check-case" type="checkbox" checked value="{0}" />', runCase.id);
		var sourceLink = String.format('<a target="_blank" href="TestCase/{0}.js">{0}</a>', runCase.id);
		var progress = String.format('<span class="progress-bar"><span class="progress-value"></span></span><span class="progress-text"></span>');

		var tdHtml = String.format(
			'<td>{0}</td>' +
			'<td>{1}</td>' +
			'<td>{2}</td>' +
			'<td>{3}</td>' +
			'<td>{4}</td>' +
			'<td>{5}</td>' +
			'<td>{6}</td>',
			/*{0}*/checkbox,	/*{1}*/sourceLink,	/*{2}*/runCase.name,	/*{3}*/runCase.repeat,
			/*{4}*/progress,	/*{5}*/'未开始',		/*{6}*/'未开始');

		var trDom = document.createElement('tr');
		trDom.innerHTML = tdHtml;
		elements.tblCase.appendChild( trDom );
		trDom.runcase = runCase.id;
		trDom.onclick = function () {
			var chk = document.getElementById( 'chk-' + this.runcase );
			chk.checked = !chk.checked;
		}

		var progressBar = trDom.getElementsByClassName("progress-bar")[0];
		var totalWidth = progressBar.clientWidth - progressBar.style.borderLeftWidth - progressBar.style.borderRightWidth;
		var progressValue = trDom.getElementsByClassName("progress-value")[0];
		var progressText = trDom.getElementsByClassName("progress-text")[0];
		var timeTd = trDom.childNodes[trDom.childNodes.length - 2];
		var speedTd = trDom.childNodes[trDom.childNodes.length - 1];

		runCase.update = function (finish, total, time) {

			/*进度条更新*/
			var percent = finish / total;
			progressValue.style.width = Math.round(totalWidth * percent) + 'px';
			progressText.innerText = Math.round(percent * 100) + "%";

			/*时间更新*/
			timeTd.innerText = Math.round(time) + " ms";

			/*速度更新*/
			var speed = Math.round(finish / time * 1000);
			speedTd.innerText = String.format("{0} 次/s", isNaN(speed) ? 0 : speed);
		}
	}

	function addCase(runCase) {
		addCaseToUI(runCase);
		caseQueue[runCase.id] = runCase;
	}

	function triggerRunningStatus() {
		elements.btnRunAll.disabled ^= true;
		elements.btnRunSelected.disabled ^= true;
		elements.btnCancel.disabled ^= true;
	}

	function runAll() {
		triggerRunningStatus();
		for (var i in caseQueue) {
			caseQueue[i].update(0, caseQueue[i].repeat, 0);
			engine.run(caseQueue[i]);
		}
	}

	function runSelected() {
		triggerRunningStatus();
		for (var i in caseQueue) {
			caseQueue[i].update(0, caseQueue[i].repeat, 0);
		}
		$('input.check-case:checked').each(function () {
			engine.run(caseQueue[this.value]);
		});
	}

	elements.btnRunAll.onclick = runAll;
	elements.btnRunSelected.onclick = runSelected;
	elements.btnCancel.onclick = function () {
		engine.break();
		triggerRunningStatus();
	};


	var scriptQueue = [];
	var scriptLoading = false;
	function addCaseById(id) {
		if (id) {
			var path = 'TestCase/' + id + '.js';
			scriptQueue.push(path);
		}

		if (scriptLoading || !scriptQueue.length) return;

		scriptLoading = true;
		var script = document.createElement("script");
		script.src = scriptQueue.shift();
		script.onload = function () {
			scriptLoading = false;
			addCaseById();
			script.onload = null;
		};
		document.body.appendChild(script);
	}

	engine.setupLogger(setStatus);
	engine.runBenchmark(function (finish, total) { setStatus("[Benchmark] " + Math.round(finish / total * 100) + "%"); });

	/*暴露该接口*/
	window.addCase = addCase;
	window.addCaseById = addCaseById;
})(window);