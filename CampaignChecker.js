//ФУНКЦИИ; НАЧАЛО программы ниже - тебе туда и надо!

function putLabel(labelName, AdObject, labelCounterToString) {
  	     if (labelCounterToString === undefined) {
             labelCounterToString = '';
         }
  
  		 var mergeLabels = labelName + labelCounterToString;
  
         var labelIter = AdWordsApp.labels().withCondition('Name = ' + mergeLabels).get();
         if (!labelIter.hasNext()) {
             var labelBuilder = AdWordsApp.createLabel(mergeLabels);
             //var newLabelIter = AdWordsApp.labels().withCondition('Name = ' + labelBuilder).get();
            // while(newLabelIter.hasNext()){
             //var newLabel =  newLabelIter.next().getName();
              //Logger.log(newLabel);
             var postLabel = AdObject.applyLabel(mergeLabels);
            //}
		 } else {
             var label = labelIter.next().getName();
             var postLabel = AdObject.applyLabel(label);
             Logger.log(label);
         }
  		return  mergeLabels;
}

//удаление лишних строк и колонок в доп. листах
function sheetRize(sheet) {
         var numberColumnsToDelete = sheet.getMaxColumns() - sheet.getLastColumn();
         var numberRowsToDelete = sheet.getMaxRows() - sheet.getLastRow();

         var deleteColumns = sheet.deleteColumns((sheet.getLastColumn() + 1), numberColumnsToDelete);
         var deleteRows = sheet.deleteRows(sheet.getLastRow() + 1, numberRowsToDelete);
}


function nameCheck(campaignName, type, location, language, stage, persona, creativeType) {
  var stageList = ['_See', '_Think_', '_Do_', '_Care_'];
  var personaList = ['_Other_', '_PPC_', '_SMM_', '_SEO_'];
  var creativeTypeList = ['_Pic', '_Text'];
  
  if (campaignName.search(type) == -1) {
      Logger.log('ERROR. Не нашел тип кампании (SRCH/GDN) в названии кампании');
      return 'Error'; 
  }
  
  switch (type) {
    case '_SRCH_':
  		if (campaignName.search(location) == -1) {
          	Logger.log('ERROR. Не нашел в кампании ' + location);
          	return 'Error';
  		}
      	
      	var counter = 0;
      	for (var i = 0; i < language.length; i++) {
          if (campaignName.search(language[i]) != -1) {
          	  counter++;
         }
        }
      	if (counter == 0) {
          	Logger.log('ERROR. Не нашел в кампании ' + language);
            return 'Error';
        }
   	break;
    case '_GDN_':
      	//защита от дурака
      	var counter = 0;
      	for (var i = 0; i < stageList.length; i++) {
        	if (stageList[i] == stage) {
            	counter = 1;
            }
        }
      	
      	if (counter == 0) {
        	Logger.log('ERROR. С ошибками написана стадия в переменной stage. У тебя stage = ' + stage + 'а можно только ' + stageList);
          	return 'Error';
        }
      
      	var counter = 0;
      	for (var i = 0; i < personaList.length; i++) {
        	if (personaList[i] == persona) {
            	counter = 1;
            }
        }
      	
      	if (counter == 0) {
        	Logger.log('ERROR. С ошибками написана персона в переменной persona. У тебя stage = ' + persona + 'а можно только ' + personaList);
          	return 'Error';
        }
      
      	var counter = 0;
      	for (var i = 0; i < creativeTypeList.length; i++) {
        	if (creativeTypeList[i] == creativeType) {
            	counter = 1;
            }
        }
      	
      	if (counter == 0) {
        	Logger.log('ERROR. С ошибками написана персона в переменной creativeType. У тебя stage = ' + creativeType + 'а можно только ' + creativeTypeList);
          	return 'Error';
        }
      
      
      	if (campaignName.search(location) == -1) {
  			Logger.log('ERROR. Не нашел в кампании ' + location);
          	return 'Error';
  		}
        if (campaignName.search(stage) == -1) {
            Logger.log('ERROR. Не нашел в кампании ' + stage);
          	return 'Error';
         }
      	//если это кампания не на новых юзеров, то проверяем, указана ли персона;
      	if (stage != '_See') {
      		if (campaignName.search(persona) == -1) {
  				Logger.log('ERROR. Не нашел в кампании ' + persona);
              	return 'Error';
  			}
        }
        if (campaignName.search(creativeType) == -1) {
            Logger.log('ERROR. Не нашел в кампании ' + creativeType);
          	return 'Error';
         }
    break;
  }
} 

//очень осторожно с аргументами функции! Посылать ровно в таком порядке!!!
function makeSpreadSheet(campaignForCheck, campaignName, defaultDeliveryMethod, defaultLanguage, 
                         defaultTargetingMethod, defaultExclusionMethod, defaultAgeList, 
                         defaultHouseholdIncomeList, defaultGenderList, defaultParentalStatusList) {
            var findSpreadSheet = DriveApp.getFilesByName(campaignName);
            if (findSpreadSheet.hasNext()) {
              Logger.log('Файл ' + campaignName + ' уже на диске!');
              return;
            }
            var spreadSheet = SpreadsheetApp.create(campaignName, 2, 2);
            var titleList = ['Campaign', 'Delivery Method', 'Networks', 'Languages', 'Targeting method', 'Exclusion method'];
            var passTitleList = spreadSheet.appendRow(titleList);
			
            var defaultLanguageToString = defaultLanguage.join(';');
            var defaultNetworks = 'Search partners';
            var defaultOptionsList = [campaignName, defaultDeliveryMethod, defaultNetworks, defaultLanguageToString, defaultTargetingMethod, defaultExclusionMethod];
            var passDefaultOptions = spreadSheet.appendRow(defaultOptionsList);
            

  
            //второй лист
            var secondSheet = spreadSheet.insertSheet('Ad_Group_1');
  			var secondTitleList = ['Campaign', 'Ad Group', 'Age', 'Household Income'];
  			var passSecondTitle = secondSheet.appendRow(secondTitleList);
  			sheetRize(secondSheet);
           
  			//третий лист
  			var thirdSheet = spreadSheet.insertSheet('Ad_Group_2');
  			var thirdtitleList = ['Campaign', 'Ad Group', 'Parental Status', 'Gender'];
  			var passThirdTitle = thirdSheet.appendRow(secondTitleList);
  			sheetRize(thirdSheet);
            //удаление лишних строк и колонок
  
  			var adGroupIter = campaignForCheck.adGroups().get();
    		while (adGroupIter.hasNext()) {
              var adGroup = adGroupIter.next();
              var adGroupName = adGroup.getName();
              var adGroupFirstTargetingList = [[]];

              //листы с возрастом и доходом одинаковы по длинне!
              for (var i = 0; i < defaultAgeList.length; i++) {
                  adGroupFirstTargetingList[i].push(campaignName);
                  adGroupFirstTargetingList[i].push(adGroupName);
                  adGroupFirstTargetingList[i].push(defaultAgeList[i]);
                  adGroupFirstTargetingList[i].push(defaultHouseholdIncomeList[i]);
                  var passFirstTargetingList = secondSheet.appendRow(adGroupFirstTargetingList[i]);
                  if (i != defaultAgeList.length - 1) {
                  	adGroupFirstTargetingList.push([]);
                  }
              }

              var adGroupSecondTargetingList = [[]];
              for (var i = 0; i < defaultGenderList.length; i++) {
                  adGroupSecondTargetingList[i].push(campaignName);
                  adGroupSecondTargetingList[i].push(adGroupName);
                  adGroupSecondTargetingList[i].push(defaultGenderList[i]);
                  adGroupSecondTargetingList[i].push(defaultParentalStatusList[i]);
                  var passSecondTargetingList = thirdSheet.appendRow(adGroupSecondTargetingList[i]);
                  if (i != defaultGenderList.length - 1) {
                  	adGroupSecondTargetingList.push([]);
                  }
              }
        	}
  
  			Logger.log('Создан файл ' + campaignName + ' на драйве, где есть базовые настройки кампании');
            Logger.log('Загрузите его через Editor: Account -> Import -> Paste Text');
  			Logger.log('');
  			
  			return;
}

function budgetCheck(campaignForCheck, campaignName, defaultDeliveryMethod, defaultLanguage, defaultGeo, defaultTargetingMethod, defaultExclusionMethod) {
         var budget = campaignForCheck.getBudget().getAmount();
         var budgetToString = budget.toString();
         var arrayBudget = budgetToString.split("");
             if (arrayBudget.length > 3) {
                 Logger.log('------------------------------------------------------------------');
                 Logger.log('!!!!--Бюджет больше 1000$ (ТЫСЯЧИ) - так ТОЧНО должно быть?---!!!!!');
                 Logger.log('------------------------------------------------------------------');
               	 Logger.log('');
             }
  
        var delivery = campaignForCheck.getBudget().getDeliveryMethod();
  		var defaultDeliveryMethodToUpperCase = defaultDeliveryMethod.toUpperCase();
             if (delivery != defaultDeliveryMethodToUpperCase) {
                 Logger.log('Пожалуйста, измените Delivery Method в настройках кампании');
               	 Logger.log('Вам поможет файл, который создан у вас на драйве с именем ' + campaignName);
				 Logger.log('');
             }
}



//функции, которые меняют все АВТОМАТИЧЕСКИ
function sheduleCheck(campaignForCheck, defaultShedule, defaultDayBidAdj) {
         for (var i = 0; i < defaultShedule.length; i++) {
         		var sheduleMaker = campaignForCheck.addAdSchedule(defaultShedule[i], 0, 0, 24, 0, defaultDayBidAdj[i]);
         }             
}

function deviceAdjCheck(campaignName, campaignForCheck) {
         if (campaignName.search('_Mobile') == -1) {
              	//0.0 - это -100%; 1.0 - 0%
                var mobileAdjMaker = campaignForCheck.targeting().platforms().mobile().get().next().setBidModifier(0.0);
                var tabletAdjMaker = campaignForCheck.targeting().platforms().tablet().get().next().setBidModifier(1.0);
                var desktopAdjMaker = campaignForCheck.targeting().platforms().desktop().get().next().setBidModifier(1.0);
           
           		return;
            } 
  
        var mobileAdjMaker = campaignForCheck.targeting().platforms().mobile().get().next().setBidModifier(1.0);
        var tabletAdjMaker = campaignForCheck.targeting().platforms().tablet().get().next().setBidModifier(0.0);
        var desktopAdjMaker = campaignForCheck.targeting().platforms().desktop().get().next().setBidModifier(0.0);
} 

function bidStrategyCheck(campaignName, campaignForCheck) {
    	if (campaignName.search('_SRCH_') !== -1) {

    		//https://developers.google.com/adwords/api/docs/guides/bidding
    		//TARGET_SPEND - обычно для GDN
    		//MANUAL_CPC - обычно для SRCH
          	var getBidStrategy = campaignForCheck.bidding().getStrategy();
          	if (getBidStrategy == 'MANUAL') {
            	Logger.log('Проверь, стоит ли "Enhanced CPC" в стратегии кампании (Bid Strategy)');
              	return;
            }
          
    		var newBidStrategy = campaignForCheck.bidding().setStrategy('MANUAL_CPC');
          	Logger.log('Настроил дефолтную стратегию - Manual CPC. ПОСТАВЬ "Enhanced CPC"!');
          
          	return;
        	}
    
        var newBidStrategy = campaignForCheck.bidding().setStrategy('TARGET_SPEND');
}

function adRotationCheck(campaignForCheck) {
    	var setAdRotation = campaignForCheck.setAdRotationType('OPTIMIZE');
}


function audienceCheck(campaignForCheck, defaultBasicExcludeAudiences) {
  		var compareList = [];
    	var audiencesIter = campaignForCheck.targeting().excludedAudiences().get();
    	while (audiencesIter.hasNext()) {
        	var audience = audiencesIter.next().getName();
              	if (defaultBasicExcludeAudiences.search(audience) > -1) {
                  var firstIndex = defaultBasicExcludeAudiences.indexOf(audience);
                  var lastIndex = audience.length;
                  
                  compareList.push(defaultBasicExcludeAudiences.substring(firstIndex, firstIndex + lastIndex));
                } else {
                  compareList.push(audience);
                }
          
        }
  		
  		var compareListToString = compareList.join();
  		var audienceToAddList = [];
  		
  		var modifiedDefaultBasicAudiences = defaultBasicExcludeAudiences.replace(/, /g, ',');
  		var defaultBasicAudiencesList = modifiedDefaultBasicAudiences.split(',');
  
  		for (var i = 0; i < defaultBasicAudiencesList.length; i++) {
        	if(compareListToString.search(defaultBasicAudiencesList[i]) == -1) {
            	audienceToAddList.push(defaultBasicAudiencesList[i]);
            }
        }
  
		if (audienceToAddList.length != 0) {
			Logger.log('Надо добавить в исключения эти аудитории: ' + audienceToAddList);
        }
  		
  		Logger.log('');
}
function languageCheck(campaignForCheck, campaignName, defaultDeliveryMethod, defaultLanguage, defaultGeo, defaultTargetingMethod, defaultExclusionMethod) {
		var languageIter =  campaignForCheck.targeting().languages().get();
    	
  		while (languageIter.hasNext()) {
        	var language = languageIter.next();
          	var defaultLanguageToString = defaultLanguage.join();
          	var languageName = language.getName();
          	if (defaultLanguageToString.search(languageName) == -1) {
            	Logger.log('ERROR. Пожалуйста, добавьте в таргетинг данный (-ые) язык (-и) ' + defaultLanguageToString);
              	Logger.log('NOTIFY. Проверьте, нужен ли в таргетинге язык ' + languageName.toUpperCase() + '?');
              	Logger.log('');
            	}
        	}
}

function geoCheck(campaignForCheck, defaultGeo, defaultExclusionGeo) {
    	var geoIter = campaignForCheck.targeting().targetedLocations().get();
  		while (geoIter.hasNext()) {
        	var geo = geoIter.next();
          	var geoId = geo.getId();
          	var defaultGeoToString = defaultGeo.join();
          	if (defaultGeoToString.search(geoId) == -1) {
              	geo.remove();
            }
		}
  		
  		for (var i = 0; i < defaultGeo.length; i++) {
        	campaignForCheck.addLocation(defaultGeo[i]);
        }
  
  		for (var i = 0; i < defaultExclusionGeo.length; i++) {
        	campaignForCheck.excludeLocation(defaultExclusionGeo[i]);
        }
}

function trackingCheck(campaignForCheck, campaignName, label, defaultNetwork, finalUrl) {
  				var adGroupsIter = campaignForCheck.adGroups().get();
  				var adGroupCounter = 1;
                Logger.log('---' + adGroupCounter + '----');
  				while (adGroupsIter.hasNext()) {
                    var adGroup = adGroupsIter.next();
                  	var adGroupErrorCounter = 0;
                    if (adGroup.isEnabled()) {
                      	var adGroupErrorCounter = 0;
                      	var adGroupLabel = 'GroupError';

                        var adGroupName = adGroup.getName();
                        var modifiedAdGroup = adGroupName.replace(/ /g, '_');
						
                        var adsIter = adGroup.ads().get();
                      	var adLabelCounter = 1;
                      	//var prevUrl = 0;
                            while(adsIter.hasNext()) {
                                var ad = adsIter.next();
                              	var adErrorCounter = 0;
                              	//&& ad.urls().getTrackingTemplate() != prevUrl
                                if (ad.isEnabled()) {
                                    var adsTrackingTemplate = ad.urls().getTrackingTemplate();
                                  
                                  	var adLabelCounterToString = adLabelCounter.toString();
                                 	var adLabelName = 'AdError';

                                    if (adsTrackingTemplate.search(modifiedAdGroup) == -1) {
                                        Logger.log('ERROR. Пожалуйста, отредактируйте часть "KW" в трекинге в группе "' + adGroupName + '"');
                                      	adErrorCounter++;
                                      	adGroupErrorCounter++;
                                    }

                                    if (adsTrackingTemplate.search(campaignName) == - 1) {
                                        Logger.log('ERROR. Пожалуйста, отредактируйте часть "CMP" в трекинге в группе "' + adGroupName + '"');
                                        adErrorCounter++;
                                      	adGroupErrorCounter++;
                                    }

                                    if (adsTrackingTemplate.search(label) == - 1) {
                                        Logger.log('ERROR. Пожалуйста, отредактируйте часть "LABEL" в трекинге в группе "' + adGroupName + '"');
                                      	adErrorCounter++;
                                      	adGroupErrorCounter++;
                                    }

                                    if (adsTrackingTemplate.search(defaultNetwork) == - 1) {
                                        Logger.log('ERROR. Пожалуйста, отредактируйте часть "NETWORK" в трекинге в группе "' + adGroupName + '"');
                                      	adErrorCounter++;
                                      	adGroupErrorCounter++;
                                    }

                                    var adsUrl = ad.urls().getFinalUrl();

                                    if (adsUrl.search(finalUrl) == - 1) {
                                        Logger.log('ERROR. Пожалуйста, отредактируйте "Final Url" в "' + adGroupName + '"');
                                      	adErrorCounter++;
                                      	adGroupErrorCounter++;
                                  	}
                                  
                                  	if (adErrorCounter > 0) {
                                      	var mergeLabels = putLabel(adLabelName, ad, adLabelCounterToString);
                                      	adLabelCounter++;
                                  		Logger.log('См. рекламу с label ' + mergeLabels);
                                      	Logger.log('');
                                    }
                                  //prevUrl = adsTrackingTemplate;
                               } 
                         }
                      
                      var keywordIter = adGroup.keywords().get();
                      var adGroupFirstPageCpc = 0;
                      while(keywordIter.hasNext()) {
                        	var keyword = keywordIter.next();
                          	var keywordMatchType = keyword.getMatchType();
                          	var keywordText = keyword.getText();
                          	var keywordTextList = keywordText.split(' ');
                          
                          	var keywordErrorCounter = 0;
                          	var keywordLabel = 'KeywordError';
                          	
                          	if (keywordMatchType == 'BROAD') {
                              for (var i = 0; i < keywordTextList.length; i++) {
                                //особенность regexp - знак плюса (+) так просто не найдешь)
                                if (keywordTextList[i].search(/\+/) == -1) {
                                  	keywordErrorCounter++;
                                }
                              }
                              if (keywordErrorCounter > 0) {
                                  putLabel(keywordLabel, keyword);
                                  Logger.log('ERROR. Ключ "' + keywordText + '" в группе "' + adGroupName + '" широкого соотвествия без + (плюсов)!');
                                  Logger.log('Кейводр с ошибкой "' + keywordText + '" обозначен label ' + keywordLabel);
                              }
                              //Logger.log('Кейводр с ошибкой "' + keywordText + '" обозначен label ' + keywordLabel);
                            }
                          
                          	var keywordFirstPageCpc = keyword.getFirstPageCpc();
                          	if (keywordFirstPageCpc == null) {
                            	keywordFirstPageCpc = 0.01;
                            }
                            var keywordSetDefaultMaxCpc = keyword.bidding().setCpc(keywordFirstPageCpc);
                          	if (adGroupFirstPageCpc < keywordFirstPageCpc) {
                            	adGroupFirstPageCpc = keywordFirstPageCpc;
                            }
                      }
                      var adGroupBidding = adGroup.bidding().setCpc(adGroupFirstPageCpc);
                      
                      if (adGroupErrorCounter > 0) {
                          putLabel(adGroupLabel, adGroup);
                          Logger.log('См. группу с label ' + adGroupLabel);
                        
                          adGroupCounter++;
                          Logger.log('');
                          Logger.log('---' + adGroupCounter + '----');
                      }
                    }
				}
}

function siteLinkChecker(campaignForCheck, campaignName, label, defaultNetwork, defaultDevice) {
        var siteExtensionIter = campaignForCheck.extensions().sitelinks().get();
    	if (siteExtensionIter.hasNext()) {
        	return;
        }
  		//здесь можно и нужно сделать универсальные для всех кампании сайтлинки.
  		Logger.log('Сайтлинки не обнаружены. Применяю универсальные');
  		Logger.log('');
    	var siteLinkBuilder = AdWordsApp.extensions().newSitelinkBuilder();
    	var firstSiteLink = siteLinkBuilder
     						.withLinkText('Domain vs Domain')
    						.withDescription1('Compare Domains by Keywords')
        					.withDescription2('Identify common & unique keywords!')
        					.withFinalUrl('https://www.semrush.com/info/domain_vs_domain/')
        					.withTrackingTemplate('{lpurl}?kw=Sitelink_Domain_vs_Domain&cmp=' + campaignName + '&label' + label + defaultNetwork + defaultDevice)
        					.build()
        					.getResult();
    
    	var secondSiteLink = siteLinkBuilder
     						.withLinkText('Blog')
    						.withDescription1('Hot Digital Marketing Topics')
        					.withDescription2('SEO, PPC, Content, PR, SMM & more!')
        					.withFinalUrl('https://www.semrush.com/blog/')
        					.withTrackingTemplate('{lpurl}?kw=Sitelink_Blog&cmp=' + campaignName + '&label' + label + defaultNetwork + defaultDevice)
        					.build()
        					.getResult();
    
   		var thirdSiteLink = siteLinkBuilder
     						.withLinkText('Plans and Prices')
        					.withFinalUrl('https://www.semrush.com/prices/')
        					.withTrackingTemplate('{lpurl}?kw=Sitelink_Plans_and_Prices&cmp=' + campaignName + '&label' + label + defaultNetwork + defaultDevice)
        					.build()
        					.getResult();
    
    	var fouthSiteLink = siteLinkBuilder
     						.withLinkText('Ranking factors research')
    						.withDescription1('SEO Ranking Factors 2.0 by SEMrush')
        					.withDescription2('5 new factors added and more!')
        					.withFinalUrl('https://www.semrush.com/ranking-factors/')
        					.withTrackingTemplate('{lpurl}?kw=Sitelink_Ranking_factors&cmp=' + campaignName + '&label' + label + defaultNetwork + defaultDevice)
        					.build()
        					.getResult();
    
    	var fifthSiteLink = siteLinkBuilder
     						.withLinkText('Free Webinars')
    						.withDescription1('Watch one of our free webinars and')
        					.withDescription2('begin to improve your SEO results!')
        					.withFinalUrl('https://www.semrush.com/webinars/')
        					.withTrackingTemplate('{lpurl}?kw=Sitelink_Free_Webinars&cmp=' + campaignName + '&label' + label + defaultNetwork + defaultDevice)
        					.build()
        					.getResult();
    
    	var addFirstSiteLink = campaignForCheck.addSitelink(firstSiteLink);
    	var addSecondSiteLink = campaignForCheck.addSitelink(secondSiteLink);
    	var addThirdSiteLink = campaignForCheck.addSitelink(thirdSiteLink);
    	var addFouthSiteLink = campaignForCheck.addSitelink(fouthSiteLink);
    	var addFifthSiteLink = campaignForCheck.addSitelink(fifthSiteLink);
}

function calloutChecker(campaignForCheck) {
    	var calloutExtensionIter = campaignForCheck.extensions().callouts().get();
    	if (calloutExtensionIter.hasNext()) {
        	return;
        }
    	Logger.log('Коллауты не обнаружены. Применяю универсальные');
  
  		//здесь можно и нужно сделать универсальные для всех кампании коллауты.
    	var calloutBuilder = AdWordsApp.extensions().newCalloutBuilder();
    	var	firstCallout = calloutBuilder
    					   .withText('450+ million domains')
    					   .build()
    					   .getResult();
    
    	var	secondCallout = calloutBuilder
    					   .withText('Best SEO Tool 2017 Winner')
    					   .build()
    					   .getResult();
    
    	var	thirdCallout = calloutBuilder
    					   .withText('140+ geo databases')
    					   .build()
    					   .getResult();
    
    	var	fouthCallout = calloutBuilder
    					   .withText('2.5+ million users')
    					   .build()
    					   .getResult();
    
    	var addFirstCallout = campaignForCheck.addCallout(firstCallout);
    	var addSecondCallout = campaignForCheck.addCallout(secondCallout);
    	var addThirdCallout = campaignForCheck.addCallout(thirdCallout);
    	var addFouthCallout = campaignForCheck.addCallout(fouthCallout);
}

function addNegativeList (campaignForCheck, negativeKeywordList) {
         var negativeKeywordListIter = AdWordsApp.negativeKeywordLists().withCondition('Name = ' + negativeKeywordList).get();
  		 if (!negativeKeywordListIter.hasNext()) {
         	Logger.log('ERROR. Такого Shared Negative List с названием ' + negativeKeywordList + ' нет на аккаунте!');
            Logger.log('');
            return;
         }
         while (negativeKeywordListIter.hasNext()) {
                var sharedNegativeList = negativeKeywordListIter.next();
                var addSharedNegativeList = campaignForCheck.addNegativeKeywordList(sharedNegativeList);
         }
  		 Logger.log('К кампании добавлен Shared Negative List ' + sharedNegativeList);
  		 Logger.log('');
}
		

//НАЧАЛО ПРОГРАММЫ!
//порядок работы
//0. ПЕРЕНОС СКРИПТА: обязательно измени default параметры относительно аккаунта, на который переносишь!
//измени (см. выше) универсальные сайтлинки и коллауты

//1. Заполни campaignName, type, finalUrl, label. Остальное уже должно быть настроено относительно аккаунта
//2. Запусти скрипт
//3. Еще раз загрузи кампанию в Editor'e (подгрузи настройки!)
//4. Только ПОСЛЕ этого, используй, если надо, файл на диске (см. логи). Залей через Paste Text настройки.
//5. Исправь ошибки, на которые тебе указывает лог
//6. Выгрузи кампанию через Editor. Все.
//успехов!
function main() {
  
  //вводные параметры - ОБЯЗАТЕЛЬНО ЗАПОЛНИТЬ!
  var campaignName = 'US_SRCH_Test_Remove_EN';
  var type = '_SRCH_';
  var finalUrl = 'https://www.test.com/test/';
  //обязательно через =
  var label = '=Test';
  
  //пиши, в какой негатив-лист надо добавить нашу кампанию; по умолчанию - Trash;
  var negativeKeywordList = 'Trash';
  
  //меняем также тут!
  
  //для SRCH;
  var language = ['_EN'];
  
  //для GDN;
  //еще не тестил!!!!
  var stage = '_See';
  var persona = '_Other_';
  var creativeType = '_Pic_';
  
  //обычно, не меняется!
  var location = 'US_';
  
  //ЗДЕСЬ МЕНЯТЬ НИЧЕГО НЕ НАДО!
  //первая проверка - нэйминг (самая первая функция)
  var namingStatus = nameCheck(campaignName, type, location, language, stage, persona, creativeType);
  if (namingStatus == 'Error') {
  	  return;
  }
  
  //стандарт (может быть в других аккаунтах иным)
  //ОБЫЧНО НАСТРАИВАЕТСЯ ПРИ ИМПЛЕМЕНТАЦИИ СКРИПТА НА АККАУНТ
  //менять исходя из аккаунта
  var defaultShedule = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  var defaultDayBidAdj = [1, 1, 1, 1, 1, 0.5, 0.5];
  var defaultNetwork = '&Network={network}';
  var defaultDevice = '&Device={device}';
  var defaultDeliveryMethod = 'Standard';
  var defaultBasicExcludeAudiences = 'Transactions ≥ 1_last_40days, Registrations per user > 5_540 days, Annual&Custom paid users_540 days, User not allow advertising New, User not allow advertising Old';
  //см. ISO 639-1 standard language codes
  var defaultLanguage = ['en'];
  //US; можно посмотреть в Locations в Editor'e
  var defaultGeo = [2840];
  var defaultTargetingMethod = 'Location of presence';
  var defaultExclusionMethod = 'Location of presence'; 
  //исключения, характерные для US; можно посмотреть в Excluded Locations в Editor'e
  var defaultExclusionGeo = [2528, 2368, 2214, 2320, 2170, 2792, 2540, 2288, 2040, 2203, 2112, 2504, 2586, 2688, 2348, 2048, 2231, 
                             2144, 2152, 2499, 2056, 2418, 2090, 2480, 2634, 2340, 2246, 2376,	2084, 2052, 2156, 2392, 2360, 2682, 
                             2724, 2752, 2598, 2222, 2780, 2496, 2704, 2218, 2276,	2882, 2703, 2686, 2196, 2050, 2807, 2044, 2398, 
                             2764, 2887, 2554, 2643, 2440, 2400, 2242, 2032, 2578, 2116, 2442, 2702, 2804, 2566, 2076, 2328, 2332, 
                             2410, 2036, 2512, 2756, 2626, 2070, 2316, 2492, 2740, 2826, 2372, 2051, 2031, 2710, 2300, 2818, 2558, 
                             2574, 2434, 2784, 2800, 2008, 2484, 2208, 2604, 2716, 2188, 2620, 2616, 2428, 2233, 2705, 2659, 2250, 
                             2860, 2642, 2706, 2414, 2404, 2380, 2583, 2096, 2458, 2662, 2028, 2548, 2100, 2124, 2470, 2690, 2308,	
                             2191, 2004, 2858, 2068, 2132, 2064, 2524, 2012, 2762, 2352, 2608, 2788, 2862];
  var defaultAgeList = ['18-24', '25-34', '35-44', '45-54', '55-64', '65-up', 'Unknown'];
  var defaultHouseholdIncomeList = ['Top 10%', '11-20%', '21-30%', '31-40%', '41-50%', 'Lower 50%', 'Unknown'];
  var defaultGenderList = ['Male', 'Female', 'Unknown'];
  var defaultParentalStatusList = ['Parent', 'Not a parent', 'Unknown'];
  
  var campaignRetrive = AdWordsApp.campaigns().withCondition('Name = ' + campaignName).get();
  
  if (campaignRetrive.hasNext()){
    	var campaignForCheck = campaignRetrive.next();

        makeSpreadSheet(campaignForCheck, campaignName, defaultDeliveryMethod, defaultLanguage, 
                        defaultTargetingMethod, defaultExclusionMethod, defaultAgeList, 
                        defaultHouseholdIncomeList, defaultGenderList, defaultParentalStatusList);
    	sheduleCheck(campaignForCheck, defaultShedule, defaultDayBidAdj);
    	deviceAdjCheck(campaignName, campaignForCheck);
   		bidStrategyCheck(campaignName, campaignForCheck);
    	budgetCheck(campaignForCheck, campaignName, defaultDeliveryMethod, defaultLanguage, defaultGeo, defaultTargetingMethod, defaultExclusionMethod);
		adRotationCheck(campaignForCheck);
    	audienceCheck(campaignForCheck, defaultBasicExcludeAudiences);
    	languageCheck(campaignForCheck, campaignName, defaultDeliveryMethod, defaultLanguage, defaultGeo, defaultTargetingMethod, defaultExclusionMethod);
    	geoCheck(campaignForCheck, defaultGeo, defaultExclusionGeo);
   		trackingCheck(campaignForCheck, campaignName, label, defaultNetwork, finalUrl);
    	siteLinkChecker(campaignForCheck, campaignName, label, defaultNetwork, defaultDevice);
    	calloutChecker(campaignForCheck);
    	addNegativeList(campaignForCheck, negativeKeywordList);
    
    	Logger.log('На всякий случай проверь, в Ad Groups наличие таргетингов по ВОЗРАСТУ, ГЕНДЕРУ, ДОХОДУ И РОДИТЕЛЬСКОМУ СТАТУСУ');
    	Logger.log('');
    	Logger.log('Готово.');
    	return;
  }
  Logger.log('Не нашел такой кампании. Точно ли название в переменной campaignName указано правильно?');  
}