
const isDnsErrorByProxy = (statusLine, responseHeaders) => {

	// statusLine だけで判定できる場合
	const targetStatusLines = [
		// Proxomitron
		'HTTP/1.1 400 Host Not Found',
	];

	if (targetStatusLines.includes(statusLine)) return true;


	if (statusLine === 'HTTP/1.1 503 Service Unavailable') {
		// TODO: 誤爆防止の為 responseHeaders もチェックする
		console.log(statusLine, responseHeaders);
		return true;
	}

	return false;
};

const callback = (details) => {
	if (isDnsErrorByProxy(details.statusLine, details.responseHeaders)) {
		chrome.notifications.create({
			type: chrome.notifications.TemplateType.BASIC,
			// iconUrl は必須のため、（とりあえず）1px * 1px の空画像を使う
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=',
			title: '多分DNSエラー',
			message: details.url,
		});

		console.debug(details);

		return {
			cancel: true,
		};
	}
};
const filter = {
	urls: [
		'*://*/*',
	],
};
const opts = ['blocking', 'responseHeaders'];

chrome.webRequest.onHeadersReceived.addListener(callback, filter, opts);
