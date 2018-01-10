///*******************************************///
///********** Partie accidentologie **********///
///*******************************************///

// Convertie un intervalle d'heure en un intervalle de minute
function getMinutesInterval(hoursInterval) {
	minutesInterval = [];
	minutesInterval[0] = (parseInt(hoursInterval[0].slice(0,2)) * 60) + parseInt(hoursInterval[0].slice(3,5));
	minutesInterval[1] = (parseInt(hoursInterval[1].slice(0,2)) * 60) + parseInt(hoursInterval[1].slice(3,5));
	return minutesInterval;
}


// Renvoie si oui ou non une heure est incluse dans un intervalle d'heure
function checkHoursInterval(hour, interval) {
	h = (parseInt(hour.slice(0,2)) * 60) + (parseInt(hour.slice(3,5)));
	if(h >= interval[0] && h <= interval[1]) {
		return true;
	}
	return false;
}


// Convertie un intervalle de date en un intervalle d'heure
function getDaysInterval(dateInterval) {
	daysInterval = [];
	daysInterval[0] = (parseInt(dateInterval[0].slice(0,4)) * 365.2425) + (parseInt(dateInterval[0].slice(5,7)) * 30.44) + parseInt(dateInterval[0].slice(8,10));
	daysInterval[1] = (parseInt(dateInterval[1].slice(0,4)) * 365.2425) + (parseInt(dateInterval[1].slice(5,7)) * 30.44) + parseInt(dateInterval[1].slice(8,10));
	return daysInterval;
}


// Renvoie si oui ou non une date est incluse dans un intervalle de date
function checkDaysInterval(date, interval) {
	d = (parseInt(date.slice(0,4)) * 365.2425) + (parseInt(date.slice(5,7)) * 30.44) + parseInt(date.slice(8,10));
	if(d >= interval[0] && d <= interval[1]) {
		return true;
	}
	return false;
}


 // Affecte un accident a une zone
 function affectZone(accident, rayon) {
 	var bestZone = -1;
 	var bestDist = [];
 	for(var i=0; i < zones.length; ++i) {
 		center = zones[i].center;
 		x = accident.properties.wgs[0];
 		y = accident.properties.wgs[1];
	 	// check coordonnee en X et Y
	 	if(x <= center[0]+rayon && x >= center[0]-rayon && y <= center[1]+rayon && y >= center[1]-rayon) {
	 		// Pas de précédente meilleur zone
	 		if(bestZone == -1) {
	 			bestZone = i;
	 			bestDist = Math.sqrt(Math.pow(center[0]-x)+Math.pow(center[1]-y));
	 		} else {	// On compare bestDist avec distCenter
	 			distCenter = Math.sqrt(Math.pow(center[0]-x)+Math.pow(center[1]-y));
	 			// Si la nouvelle distance est meilleur center divient best
	 			if(distCenter < bestDist) {
	 				bestZone = i;
	 				bestDist = distCenter;
	 			}
	 		}
	 	}
	}
	// Si on a trouve une zone on l'ajoute dedans
	if(bestZone != -1) {
		liste_accidents.push({ "zone": bestZone, "accident": accident });
		return 0;
	}
	
	// Aucune zone ne convient, on en creer donc une nouvelle
	zones.push({ "id": zones.length, "active": 0, "markerLayer": null, "center": accident.properties.wgs, "stats" : { "nbAcc": 0, "Indem": 0, "BL": 0, "BH": 0, "Fuite": 0, "Conducteur": 0, "Passage": 0, "Pieton": 0, "Velo": 0, "Scooter": 0, "Moto": 0, "Voiture": 0, "VehiculeUtilitaire": 0, "BusCar": 0, "PoidsLourd": 0, "Tram": 0  } });
	id = zones.length-1;
	liste_accidents.push({ "zone": id, "accident": accident });
 }
 
 
 // Recupere toutes les zones d'accident
 function getZones(accidents, rayon, arrondissements, annees, mois, jours, hoursInterval, dateInterval) {
 	// On convertit l'intervalle d'heure en minute
 	minutesInterval = []
 	if(hoursInterval.length != 0) {
 		minutesInterval = getMinutesInterval(hoursInterval);
 	}
 	
 	// On convertit l'intervalle de date en jours
 	daysInterval = []
 	if(dateInterval.length != 0) {
 		daysInterval = getDaysInterval(dateInterval);
 	}
 	
 	// Creation des zones d'accident
 	for(var i = 0; i < accidents.length; ++i) {
 		// Filtre par arrondissement
 		if(arrondissements.length == 0 || arrondissements.indexOf(accidents[i].properties.cp) != -1) {
 			// Filtre par un intervalle de date (priorite) ou annees - mois - jours en particulier
 			if(daysInterval.length != 0) {
 				// Filtre par un intervalle de date
 				if(checkDaysInterval(accidents[i].properties.date, daysInterval)) {
	 				// Filtre par un intervalle d'heure
	 				if(minutesInterval.length == 0 || checkHoursInterval(accidents[i].properties.heure, minutesInterval)) {
	 					id = affectZone(accidents[i], rayon);
	 				}
 				}
 			} else {	// Filtre par annees - mois - jours en particulier
	 			// Filtre par annee
	 			if(annees.length == 0 || annees.indexOf(accidents[i].properties.date.slice(0,4)) != -1) {
	 				// Filtre par mois
	 				if(mois.length == 0 || mois.indexOf(accidents[i].properties.date.slice(5,7)) != -1) {
	 					// Filtre par jours
	 					if(jours.length == 0 || jours.indexOf(accidents[i].properties.date.slice(8,10)) != -1) {
	 						// Filtre par un intervalle d'heure
	 						if(minutesInterval.length == 0 || checkHoursInterval(accidents[i].properties.heure, minutesInterval)) {
 								id = affectZone(accidents[i], rayon);
 							}
	 					}
	 				}
 				}
			}
		}
 	}
 	
 	
 	// Ajout des statistiques aux zones
 	for(var i = 0; i < liste_accidents.length; ++i) {
 		// Mise a jour du nombre d'accident par zone
 		zones[liste_accidents[i].zone].stats.nbAcc++;
 		
 		// Mise a jour de la gravite des blessures lors des accidents d'une zone (Indem, BL, BH)
 		accident = liste_accidents[i].accident.properties;
 		if(accident.usager_1_grav == "Indem") { zones[liste_accidents[i].zone].stats.Indem++; }
 		if(accident.usager_1_grav == "BL") { zones[liste_accidents[i].zone].stats.BL++; }
 		if(accident.usager_1_grav == "BH") { zones[liste_accidents[i].zone].stats.BH++; }
 		if(accident.usager_2_grav == "Indem") { zones[liste_accidents[i].zone].stats.Indem++; }
 		if(accident.usager_2_grav == "BL") { zones[liste_accidents[i].zone].stats.BL++; }
 		if(accident.usager_2_grav == "BH") { zones[liste_accidents[i].zone].stats.BH++; }
 		if(accident.usager_3_grav == "Indem") { zones[liste_accidents[i].zone].stats.Indem++; }
 		if(accident.usager_3_grav == "BL") { zones[liste_accidents[i].zone].stats.BL++; }
 		if(accident.usager_3_grav == "BH") { zones[liste_accidents[i].zone].stats.BH++; }
 		if(accident.usager_4_grav == "Indem") { zones[liste_accidents[i].zone].stats.Indem++; }
 		if(accident.usager_4_grav == "BL") { zones[liste_accidents[i].zone].stats.BL++; }
 		if(accident.usager_4_grav == "BH") { zones[liste_accidents[i].zone].stats.BH++; }
 		
 		// Nombre de vehicule en fuite
 		if(accident.usager_1_lveh == "Z") { zones[liste_accidents[i].zone].stats.Fuite++; }
 		if(accident.usager_2_lveh == "Z") { zones[liste_accidents[i].zone].stats.Fuite++; }
 		if(accident.usager_3_lveh == "Z") { zones[liste_accidents[i].zone].stats.Fuite++; }
 		
 		// Type d'usage (Conducteur, Passage, Pieton)
 		if(accident.usager_1_catu == "Cond") { zones[liste_accidents[i].zone].stats.Conducteur++; }
 		if(accident.usager_1_catu == "Pass") { zones[liste_accidents[i].zone].stats.Passage++; }
 		if(accident.usager_1_catu == "Piéton") { zones[liste_accidents[i].zone].stats.Pieton++; }
 		if(accident.usager_2_catu == "Cond") { zones[liste_accidents[i].zone].stats.Conducteur++; }
 		if(accident.usager_2_catu == "Pass") { zones[liste_accidents[i].zone].stats.Passage++; }
 		if(accident.usager_2_catu == "Piéton") { zones[liste_accidents[i].zone].stats.Pieton++; }
 		if(accident.usager_3_catu == "Cond") { zones[liste_accidents[i].zone].stats.Conducteur++; }	
 		if(accident.usager_3_catu == "Pass") { zones[liste_accidents[i].zone].stats.Passage++; }
 		if(accident.usager_3_catu == "Piéton") { zones[liste_accidents[i].zone].stats.Pieton++; }
 		if(accident.usager_4_catu == "Cond") { zones[liste_accidents[i].zone].stats.Conducteur++; }	
 		if(accident.usager_4_catu == "Pass") { zones[liste_accidents[i].zone].stats.Passage++; }
 		if(accident.usager_4_catu == "Piéton") { zones[liste_accidents[i].zone].stats.Pieton++; } 		
 		
 		// Type de vehicule (Velo, Scooter, Moto, Voiture, VehiculeUtilitaire, BusCar, PoidsLourd, Tram)
 		if(accident.vehicule_1_cadmin == "Bicy") { zones[liste_accidents[i].zone].stats.Velo++; }
 		if(accident.vehicule_1_cadmin == "Cyclo") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_1_cadmin == "Scoo<=50") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_1_cadmin == "Scoo50-125") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_1_cadmin == "Scoo>125") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_1_cadmin == "Moto50-125") { zones[liste_accidents[i].zone].stats.Moto++; }
 		if(accident.vehicule_1_cadmin == "Moto>125") { zones[liste_accidents[i].zone].stats.Moto++; }
 		if(accident.vehicule_1_cadmin == "VL") { zones[liste_accidents[i].zone].stats.Voiture++; }
 		if(accident.vehicule_1_cadmin == "Voi") { zones[liste_accidents[i].zone].stats.Voiture++; }
 		if(accident.vehicule_1_cadmin == "VU") { zones[liste_accidents[i].zone].stats.VehiculeUtilitaire++; }
 		if(accident.vehicule_1_cadmin == "BUS") { zones[liste_accidents[i].zone].stats.BusCar++; }
 		if(accident.vehicule_1_cadmin == "Car") { zones[liste_accidents[i].zone].stats.BusCar++; }
 		if(accident.vehicule_1_cadmin == "PL<=7,5") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_1_cadmin == "PL>7,5") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_1_cadmin == "PLRem") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_1_cadmin == "TRSem") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_1_cadmin == "Tram") { zones[liste_accidents[i].zone].stats.Tram++; }
 		
 		if(accident.vehicule_2_cadmin == "Bicy") { zones[liste_accidents[i].zone].stats.Velo++; }
 		if(accident.vehicule_2_cadmin == "Cyclo") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_2_cadmin == "Scoo<=50") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_2_cadmin == "Scoo50-125") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_2_cadmin == "Scoo>125") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_2_cadmin == "Moto50-125") { zones[liste_accidents[i].zone].stats.Moto++; }
 		if(accident.vehicule_2_cadmin == "Moto>125") { zones[liste_accidents[i].zone].stats.Moto++; }
 		if(accident.vehicule_2_cadmin == "VL") { zones[liste_accidents[i].zone].stats.Voiture++; }
 		if(accident.vehicule_2_cadmin == "Voi") { zones[liste_accidents[i].zone].stats.Voiture++; }
 		if(accident.vehicule_2_cadmin == "VU") { zones[liste_accidents[i].zone].stats.VehiculeUtilitaire++; }
 		if(accident.vehicule_2_cadmin == "BUS") { zones[liste_accidents[i].zone].stats.BusCar++; }
 		if(accident.vehicule_2_cadmin == "Car") { zones[liste_accidents[i].zone].stats.BusCar++; }
 		if(accident.vehicule_2_cadmin == "PL<=7,5") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_2_cadmin == "PL>7,5") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_2_cadmin == "PLRem") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_2_cadmin == "TRSem") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_2_cadmin == "Tram") { zones[liste_accidents[i].zone].stats.Tram++; }
 		
 		if(accident.vehicule_3_cadmin == "Bicy") { zones[liste_accidents[i].zone].stats.Velo++; }
 		if(accident.vehicule_3_cadmin == "Cyclo") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_3_cadmin == "Scoo<=50") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_3_cadmin == "Scoo50-125") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_3_cadmin == "Scoo>125") { zones[liste_accidents[i].zone].stats.Scooter++; }
 		if(accident.vehicule_3_cadmin == "Moto50-125") { zones[liste_accidents[i].zone].stats.Moto++; }
 		if(accident.vehicule_3_cadmin == "Moto>125") { zones[liste_accidents[i].zone].stats.Moto++; }
 		if(accident.vehicule_3_cadmin == "VL") { zones[liste_accidents[i].zone].stats.Voiture++; }
 		if(accident.vehicule_3_cadmin == "Voi") { zones[liste_accidents[i].zone].stats.Voiture++; }
 		if(accident.vehicule_3_cadmin == "VU") { zones[liste_accidents[i].zone].stats.VehiculeUtilitaire++; }
 		if(accident.vehicule_3_cadmin == "BUS") { zones[liste_accidents[i].zone].stats.BusCar++; }
 		if(accident.vehicule_3_cadmin == "Car") { zones[liste_accidents[i].zone].stats.BusCar++; }
 		if(accident.vehicule_3_cadmin == "PL<=7,5") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_3_cadmin == "PL>7,5") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_3_cadmin == "PLRem") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_3_cadmin == "TRSem") { zones[liste_accidents[i].zone].stats.PoidsLourd++; }
 		if(accident.vehicule_3_cadmin == "Tram") { zones[liste_accidents[i].zone].stats.Tram++; }
 	}
 }
