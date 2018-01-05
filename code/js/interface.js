///*******************************************///
///****** Partie Interface Utilisateur *******///
///*******************************************///

$( function() {
	$( ".years" ).checkboxradio({
		icon: false
	});
	$( ".months" ).checkboxradio({
		icon: false
	});
	$( ".days" ).checkboxradio({
		icon: false
	});
	$( ".arrondissements" ).checkboxradio({
		icon: false
	});
} );

function show()
{
	if(document.getElementById('intervalle').checked==true) {
		document.getElementById('date').style.visibility='visible';
		document.getElementById('date').style.display='block';
		document.getElementById('year').style.visibility='hidden';
		document.getElementById('year').style.display='none';
		document.getElementById('month').style.visibility='hidden';
		document.getElementById('month').style.display='none';
		document.getElementById('day').style.visibility='hidden';
		document.getElementById('day').style.display='none';
	} else {
		document.getElementById('date').style.visibility='hidden';
		document.getElementById('date').style.display='none';
		document.getElementById('year').style.visibility='visible';
		document.getElementById('year').style.display='block';
		document.getElementById('month').style.visibility='visible';
		document.getElementById('month').style.display='block';
		document.getElementById('day').style.visibility='visible';
		document.getElementById('day').style.display='block';
	}
}

function processForm() {
	// Variable ou l'on va stocker les parametres de l'utilisateur
	var parameters = [];

	if(document.getElementById('multiple').checked == true) {
		// Recuperation des Annees
		var inputs = document.getElementsByClassName('years');
		years = [];
		for(var i = 0; i < inputs.length; ++i) {
			if(inputs[i].checked) {
				years.push(inputs[i].value);
			}
		}
		parameters.push({ "years": years });

		// Recuperation des Mois
		var inputs = document.getElementsByClassName('months');
		months = [];
		for(var i = 0; i < inputs.length; ++i) {
			if(inputs[i].checked) {
				months.push(inputs[i].value);
			}
		}
		parameters.push({ "months": months });

		// Recuperation des Jours
		var inputs = document.getElementsByClassName('days');
		days = [];
		for(var i = 0; i < inputs.length; ++i) {
			if(inputs[i].checked) {
				days.push(inputs[i].value);
			}
		}
		parameters.push({ "days": days });
	} else {
		parameters.push({ "years": [] });
		parameters.push({ "months": [] });
		parameters.push({ "days": [] });
	}

	// Recuperation des Arrondissements
	var inputs = document.getElementsByClassName('arrondissements');
	arrondissements = [];
	for(var i = 0; i < inputs.length; ++i) {
		if(inputs[i].checked) {
			arrondissements.push(parseInt(inputs[i].value));
		}
	}
	parameters.push({ "arrondissements": arrondissements });

	if(document.getElementById('intervalle').checked == true) {
		// Recuperation de l'intervalle de dates
		var inputs = document.getElementsByClassName('dates');
		dates = [];
		for(var i = 0; i < inputs.length; ++i) {
			if(inputs[i].value != "") {
				dates.push(inputs[i].value);
			}
		}
		if(dates.length == 2) { 
			parameters.push({ "dates": dates }); 
		} else {
			parameters.push({ "dates": [] });
		}
	} else {
		parameters.push({ "dates": [] });
	}

	// Recuperation de l'intervalle d'heures
	var inputs = document.getElementsByClassName('hours');
	hours = [];
	for(var i = 0; i < inputs.length; ++i) {
		if(inputs[i].value != "") {
			hours.push(inputs[i].value);
		}
	}
	if(hours.length == 2) {
		parameters.push({ "hours": hours });
	} else { 
		parameters.push({ "hours": [] });
	}

	console.log(parameters);

	// Mise a jour de la visualisation
	visualisation(parameters);
};