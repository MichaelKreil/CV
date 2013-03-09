var fs = require('fs');


data = fs.readFileSync('../data/CV.txt', 'binary');

// Fix character set

data = data.replace(/[\x80-\xFF]/g, function (char) {
	var code = char.charCodeAt(0);
	switch (code) {
		// http://www.germantype.com/cms/front_content.php?idcat=193
		case 0: return ''; break;
		case 133: return 'Ö'; break;
		case 134: return 'Ü'; break;
		case 138: return 'ä'; break;
		case 154: return 'ö'; break;
		case 159: return 'ü'; break;
		case 167: return 'ß'; break;
		case 208: return '-'; break;
		case 210: return '"'; break;
		case 211: return '"'; break;
		case 212: return '‘'; break;
		case 213: return '’'; break;
		case 227: return '"'; break;
		default:
			console.log('Unknown Char "'+char+'", '+code+' ('+code.toString(16)+')');
			return '#####';
	}
})

data = data.split('\r');

head = data.shift().split('\t');

list = [];

// Convert to JSON

for (var i = 0; i < data.length; i++) {
	var obj = {};
	var row = data[i].split('\t');
	for (var j = 0; j < head.length; j++) {
		var value = row[j];
		if ((/^\".*\"$/).test(value)) {
			value = value.substr(1, value.length-2).replace(/\"\"/g, '"');
		}
		obj[head[j]] = value;
	}

	obj.start = getDate(obj.dayStart, obj.monthStart, obj.yearStart);
	obj.end   = getDate(obj.dayEnd,   obj.monthEnd,   obj.yearEnd  );
	obj.point = (obj.end === undefined);
	
	obj.dateDE = getDateTextDE(obj.dayStart, obj.monthStart, obj.yearStart);
	obj.dateEN = getDateTextEN(obj.dayStart, obj.monthStart, obj.yearStart);
	if (obj.yearEnd) {
		obj.dateDE += ' - '+getDateTextDE(obj.dayEnd,   obj.monthEnd,   obj.yearEnd  );
		obj.dateEN += ' - '+getDateTextEN(obj.dayEnd,   obj.monthEnd,   obj.yearEnd  );
	}

	if (obj.titleEN       == '') obj.titleEN       = obj.titleDE;
	//if (obj.descriptionEN == '') obj.descriptionEN = obj.descriptionDE;
	if (obj.linkEN        == '') obj.linkEN        = obj.linkDE;

	if (obj.titleDE       == '') obj.titleDE       = obj.titleEN;
	//if (obj.descriptionDE == '') obj.descriptionDE = obj.descriptionEN;
	if (obj.linkDE        == '') obj.linkDE        = obj.linkEN;

	checkQuotes(obj, 'titleDE',       '&bdquo;', '&ldquo;');
	checkQuotes(obj, 'titleEN',       '&ldquo;', '&rdquo;');
	checkQuotes(obj, 'descriptionDE', '&bdquo;', '&ldquo;');
	checkQuotes(obj, 'descriptionEN', '&ldquo;', '&rdquo;');

	checkLinks(obj, 'descriptionDE');
	checkLinks(obj, 'descriptionEN');


	list.push(obj);
}

// Sort events

list = list.sort(function (a, b) {
	return b.start - a.start;
})

// Export template

var EJS = require('ejs');

fs.writeFileSync('../client/index.html', EJS.render(fs.readFileSync('./template.html', 'utf8'), {locals:{list:list}}), 'utf8');

// Export JSON

fs.writeFileSync('../client/script/data.js', 'var data = '+JSON.stringify(list)+';', 'utf8');



function getDate(day, month, year) {
	if (!year) return undefined;
	if (!month) month = 1;
	if (!day) day = 1;
	return new Date(year, month-1, day);
}

function getMonthNameDE(month) {
	return ['','Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'][month];
}

function getMonthNameEN(month) {
	//return ['','January','February','March','April','May','June','July','August','September','October','November','December'][month];
	return ['','Jan.','Feb.','Mar.','Apr.','May.','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'][month];
}

function getDateTextDE(day, month, year) {
	if (!year) return undefined;
	var text = year;

	if (month) {
		text = getMonthNameDE(month) + ' ' + text;
		if (day) text = day + '. ' + text;
	}

	return text;
}

function getDateTextEN(day, month, year) {
	if (!year) return undefined;
	var text = year;

	if (month) {
		text = getMonthNameEN(month) + ' ' + text;
		if (day) text = day + ' ' + text;
	}

	return text;
}

function checkQuotes(object, field, quoteChar1, quoteChar2) {
	if (object[field]) {
		object[field] = object[field].replace(/(.?)(\")(.?)/gi, function (match,a,quote,b) {
			var quote1 = (' '.indexOf(a) >= 0);
			var quote2 = (' .,:<'.indexOf(b) >= 0);
			if (quote1 && quote2) {
				if ((a == '') && (b == '')) {
					quote1 = false;
				} else {
					console.error('Wrong Quotes in "'+object[field]+'" ('+a+','+b+','+match+')');
				}
			}
			if (quote1) return a + quoteChar1 + b;
			if (quote2) return a + quoteChar2 + b;
		})
	}
}

function checkLinks(object, field) {
	object[field] = object[field].replace(/http[s]?\:\/\/[^\s\<\)]*/g, function (url) {
		// console.log(url);
		return '<a href="'+url+'">'+url+'</a>';
	})
}