var
	contentNode,
	filterNode,
	listNode;

var
	language = (navigator.language) ? navigator.language : navigator.userLanguage,
	langSuffix = (language.toUpperCase() == 'DE') ? 'DE' : 'EN';

$(function () {

	contentNode = $('#content');
	contentNode.empty();

	listNode = $('<div id="list"></div>');
	contentNode.append(listNode);

	initData();

	filterButtons = $('#filterButtons');
	for (var i = 0; i < types.length; i++) {
		var type = types[i];
		var html = '<button type="button" class="btn btn-mini btn-active'+(type.keyfact ? ' keyfact' : '')+'" data-type="'+type.name+'">'+type['title'+langSuffix]+'</button>';
		filterButtons.append($(html));
	}

	setButtonStyle($('#filterButtons button'), true);

	$('#filterButtons button').click(function (event) {
		var button = $(event.target);
		var active = button.hasClass('btn-active');
		active = !active;

		setButtonStyle(button, active);
		redraw(listNode);
	});

	$('#btnActivateAll').click(function () {
		setButtonStyle($('#filterButtons button'), true);
		redraw(listNode);
	});

	$('#btnActivateKeyFacts').click(function () {
		setButtonStyle($('#filterButtons button'), false);
		setButtonStyle($('#filterButtons button.keyfact'), true);
		redraw(listNode);
	});

	$('#btnActivateNone').click(function () {
		setButtonStyle($('#filterButtons button'), false);
		redraw(listNode);
	});

	$('body').click(function (e) {
		// Something smarter than that?
		if ($(e.target).parents().length < 5) {
			$('.entry').removeClass('open');
		}
	});

	$('#btnActivateKeyFacts').click();
})

var activeCategories = {};

function setButtonStyle(button, active) {
	button.toggleClass('btn-active',    active);
	button.toggleClass('btn-inactive', !active);
	button.each(function (index, element) {
		activeCategories[$(element).attr('data-type')] = active;
	})
}

var categoryColors = {
	'general'      :{ color:[  0,  0,  0], titleDE:'Allgemeines'     , titleEN:'general'          }, // schwarz
	'openplanb'    :{ color:[100,100,100], titleDE:'openPlanB'       , titleEN:'openPlanB'        }, // grau
	'other'        :{ color:[200,200,200], titleDE:'Sonstiges'       , titleEN:'other'            }, // weiß
	'gema-youtube' :{ color:[158, 20, 11], titleDE:'GEMA vs. YouTube', titleEN:'GEMA vs. YouTube' }, // dunkelrot
	'afghanistan'  :{ color:[171, 34,162], titleDE:'Afghanistan'     , titleEN:'Afghanistan'      }, // rot
	'crowdflow'    :{ color:[213, 70,  0], titleDE:'crowdflow.net'   , titleEN:'crowdflow.net'    }, // orange
	'parteispenden':{ color:[235,201,  0], titleDE:'Parteispenden'   , titleEN:'party donations'  }, // gelb
	'maltespitz'   :{ color:[101,153, 61], titleDE:'Vorratsdaten'    , titleEN:'data retention'   }, // grün
	'facebook'     :{ color:[ 59, 89,151], titleDE:'Facebook'        , titleEN:'Facebook'         }, // blau
	'zugmonitor'   :{ color:[  0,132,182], titleDE:'Zugmonitor'      , titleEN:'train monitor'    }  // türkis
};

var types = [
	{ name:"award",        titleEN:"awards", 	      titleDE:"Preise",        keyfact:true  },
	{ name:"education",    titleEN:"education",     titleDE:"Ausbildung",    keyfact:true  },
	{ name:"exhibition",   titleEN:"exhibitions",   titleDE:"Ausstellungen", keyfact:false },
	{ name:"image",        titleEN:"images",        titleDE:"Bilder",        keyfact:false },
	{ name:"job",          titleEN:"job",           titleDE:"Berufliches",   keyfact:true  },
	{ name:"presentation", titleEN:"presentations", titleDE:"Vorträge",      keyfact:false },
	{ name:"press",        titleEN:"press",         titleDE:"Artikel",       keyfact:false },
	{ name:"project",      titleEN:"projects",      titleDE:"Projekte",      keyfact:true  },
	{ name:"radio",        titleEN:"radio",         titleDE:"Radio",         keyfact:false },
	{ name:"tweet",        titleEN:"tweets",        titleDE:"Tweets",        keyfact:false },
	{ name:"tv",           titleEN:"tv",            titleDE:"Fernsehen",     keyfact:false },
	{ name:"video",        titleEN:"video",         titleDE:"Videos",        keyfact:false }
];


