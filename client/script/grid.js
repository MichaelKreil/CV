
var drawList;
var catHash = {};
var catList = [];
var col2cats = [];
var cat2col = {};
var entries = [];

var layout;

function initData() {
	for (var i = 0; i < data.length; i++) {
		entries.push(new Entry(data[i]));
	}

	layout = new Layout();
}

function redraw(listNode) {
	listNode.empty();

	drawList = [];
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i];
		if (entry.isVisible()) {
			entry.show();
			drawList.push(entry);
		} else {
			entry.hide();
		}
	}

	drawList = drawList.sort(function (a, b) {
		return b.start - a.start;
	});

	drawList = [{block:drawList, headers:[]}];

	drawList = splitDrawList(drawList, 'yearStart' );
	drawList = splitDrawList(drawList, 'monthStart');

	for (var i = 0; i < catList.length; i++) {
		var cat = catList[i];
		cat.minX =  1e10;
		cat.maxX = -1e10;
		cat.minY =  1e10;
		cat.maxY = -1e10;
	}
	
	// draw
	var y0 = 0;
	var lastHeaders = [];

	var catAlreadyUsed = {};

	for (var i = 0; i < drawList.length; i++) {
		var block = drawList[i].block;
		var headers = drawList[i].headers;
		var columnHeights = [];

		if (lastHeaders[0] != headers[0]) {
			listNode.append($('<h2>' + headers[0] + '</h2>').css({top:y0+10}));
			y0 += 42;
		}

		if ((headers[1] !== undefined) && (headers[1] != '') && ((lastHeaders[0] != headers[0]) || (lastHeaders[1] != headers[1]))) {
			listNode.append($('<h3>' + getMonthName(headers[1]) + '</h3>').css({top:y0+10}));
			y0 += 31;
		}

		lastHeaders = headers;

		for (var j = 0; j < block.length; j++) {
			var entry = block[j];
			var category = entry.category;
			var color = (categoryColors[category] === undefined) ? [200,200,200] : categoryColors[category].color;
			var colId = cat2col[category];
			var colHeight = columnHeights[colId];
			if (colHeight === undefined) colHeight = 0;

			var y = y0 + colHeight;
			var x = colId*250+100;

			if (catAlreadyUsed[category] === undefined) {
				catAlreadyUsed[category] = true;

				listNode.append($('<div class="categoryHeader">' + categoryColors[category]['title'+langSuffix] + '</div>').css({
					top:y,
					left:x,
					color: 'rgb('+mixColor(color, 0.2, 255).join(',')+')'
				}));

				colHeight += 40;
				y += 40;
			}

			entry.setPosition(x,y);

			var catInfo = catList[catHash[category]];
			
			if (catInfo.minX > x) catInfo.minX = x;
			if (catInfo.minY > y) catInfo.minY = y;

			x += 220;
			y += entry.nodeHeight;

			if (catInfo.maxX < x) catInfo.maxX = x;
			if (catInfo.maxY < y) catInfo.maxY = y;

			entry.setColor(color);

			colHeight += entry.nodeHeight + 10;
			columnHeights[colId] = colHeight;
		}

		var maxHeight = 0;
		for (var j = 0; j < catList.length; j++) {
			if ((columnHeights[j] !== undefined) && (columnHeights[j] > maxHeight)) maxHeight = columnHeights[j];
		}

		y0 += maxHeight;
		/*

		if (lastHeaders[0] != headers[0]) {
			listNode.append($('<h2>'+headers[0]+'</h2>').css({top:y0}));
			y0 += 80;
		}

		if ((headers[1] !== undefined) && ((lastHeaders[0] != headers[0]) || (lastHeaders[1] != headers[1]))) {
			listNode.append($('<h3>'+getMonthName(headers[1])+'</h3>').css({top:y0}));
			y0 += 70;
		}

		lastHeaders = headers;
		*/
	}

	for (var i = 0; i < col2cats.length; i++) {
		var cats = col2cats[i].cats;
		for (var j = 0; j < cats.length; j++) {
			var catInfo = catList[cats[j]];
			var color = (categoryColors[catInfo.category] === undefined) ? [200,200,200] : categoryColors[catInfo.category].color;
			color = mixColor(color, 0.95, 255);
			listNode.append($('<div class="connection"></div>').css({
				top: catInfo.minY - 40,
				height: catInfo.maxY - catInfo.minY,
				left: catInfo.minX,
				'background-color': 'rgb('+color.join(',')+')'
			}));
		}
	}

	listNode.css({height: y0+100});

}

function splitDrawList(list, field) {
	var result = [];
	for (var i = 0; i < list.length; i++) {
		if (list[i].block.length > 1) {
			var subBlockEntries = {};
			var subBlockIds = [];
			var block = list[i].block;

			for (var j = 0; j < block.length; j++) {
				var entry = block[j];
				var id = entry[field];
				if (subBlockEntries[id] === undefined) {
					subBlockEntries[id] = [];
					subBlockIds.push(id);
				}
				subBlockEntries[id].push(entry);
			}

			for (var j = 0; j < subBlockIds.length; j++) {
				var id = subBlockIds[j];
				result.push({
					block: subBlockEntries[id],
					headers: list[i].headers.concat(id)
				});
			}
		} else {
			result.push(list[i]);
		}
	}
	return result;
}

function mixColor(color, mix, background) {
	return [
		Math.round(color[0]*(1-mix) + mix*background),
		Math.round(color[1]*(1-mix) + mix*background),
		Math.round(color[2]*(1-mix) + mix*background)
	]
}



function getMonthName(month) {
	//return ['','Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'][month];
	return ['','January','February','March','April','May','June','July','August','September','October','November','December'][month];
	//return ['','Jan.','Feb.','März','April','Mai','Juni','Juli','Aug.','Sep.','Okt.','Nov.','Dez.'][month];
}

function Entry(data) {
	var me = this;
	
	me.category = data.category;

	me.start      = new Date(data.start);
	me.end        = new Date(data.end);
	me.category   = data.category;
	me.yearStart  = data.yearStart;
	me.monthStart = data.monthStart;

	var
		node,
		title =       data['title'      +langSuffix],
		dateText =    data['date'       +langSuffix],
		description = data['description'+langSuffix],
		link =        data['link'       +langSuffix];

	var html = '';

	html += '<div class="type clickable">' + data.type + '</div>';
	html += '<div class="date">' + dateText + '</div>';
	html += '<div class="title clickable">' + title + '</div>';
	
	if (description !== '') {
		html += '<div class="description clickable">' + description + '</div>';
	}

	if (link !== '') {
		html += '<div class="link"><a href="' + link + '" target="_blank">' + link + '</a></div>';
	}

	html = '<div class="entry category-' + data.category + ' type-' + data.type + '">' + html + '</div>';


	me.hide = function () {

	}

	me.isVisible = function () {
		var active = activeCategories[data.type]
		if (active === undefined) console.error('Unknown type "'+data.type+'"');
		return active;
	}

	me.setColor = function (color) {

		node.css(getEntryCSS(color));
	}

	me.setPosition = function (x, y) {
		node.css({
			top:  y,
			left: x
		});
	}

	me.show = function () {
		node = $(html);

		node.children('.title').click(function () {
			$('.entry').removeClass('open');
			node.addClass('open');
		})

		listNode.append(node);

		me.nodeHeight = node.outerHeight();
		node.css({'position':'absolute'});
	}


	function getEntryCSS(color) {
		return {
			'background-color': 'rgb('+mixColor(color, 0.8, 255).join(',')+')',
			'border-color':     'rgb('+mixColor(color, 0.6, 255).join(',')+')',
			'color':            'rgb('+mixColor(color, 0.5,   0).join(',')+')'
		}
	}


	return me;
}

function Layout () {
	var me = this;



	// Get used categories
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i];

		var cat = entry.category;
		if (catHash[cat] === undefined) {
			catHash[cat] = {
				category:cat,
				minDate:entry.start,
				maxDate:entry.start,
				minX:  1e10,
				maxX: -1e10,
				minY:  1e10,
				maxY: -1e10
			};
		}
		if (catHash[cat].minDate > entry.start) catHash[cat].minDate = entry.start;
		if (catHash[cat].maxDate < entry.start) catHash[cat].maxDate = entry.start;
	}

	for (var cat in catHash) catList.push(catHash[cat]);

	// sort categories by min date
	catList.sort(function (a, b) {
		return a.minDate - b.minDate;
	});

	// prepare columns
	for (var i = 0; i < catList.length; i++) {
		col2cats[i] = {cats:[i], minDate:catList[i].minDate, maxDate:catList[i].maxDate};
		catHash[catList[i].category] = i;
	}

	// merge multiple categories into columns
	do {
		var found = false;
		var minDistance = 1e20;
		var index1, index2;

		for (var i1 = 0; i1 < col2cats.length; i1++) {
			var cat1 = col2cats[i1];
			for (var i2 = 0; i2 < col2cats.length; i2++) if (i1 != i2) {
				var cat2 = col2cats[i2];
				var distance = cat2.minDate - cat1.maxDate;
				if ((distance > 0) && (distance < minDistance)) {
					minDistance = distance;
					index1 = i1;
					index2 = i2;
					found = true;
				}
			}
		}

		if (found) {
			col2cats[index1].maxDate = col2cats[index2].maxDate;
			col2cats[index1].cats = col2cats[index1].cats.concat(col2cats[index2].cats);
			col2cats.splice(index2, 1);
		}
	} while (found);

	for (var i = 0; i < col2cats.length; i++) {
		var cats = col2cats[i].cats;
		for (var j = 0; j < cats.length; j++) {
			cat2col[catList[cats[j]].category] = i;
		}
	}

	return me;
}

