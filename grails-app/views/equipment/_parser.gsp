<%@ page import="edu.harvard.capstone.parser.Equipment" %>
<%@ page import="edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<%@ page import="edu.harvard.capstone.user.Scientist" %>

    <div class=" max-height no-overflow" id="content">
        <div class=" max-height">

            <div>
                <button id="saveConfig">save parsing configuration</button>
                <button id="importResults">import results</button>
            </div>

			<!-- Highlight / Error -->
			<div id="userMsgPanel" ></div>

            <div class="col-xs-8" id="mainContent">
                <div id="myGrid"></div>
            </div>

            <div class="col-xs-4" id="sidebar">
                <div id="tabs" >
                    <ul>
                        <li><a href="#parsingTab">Parsing</a></li>
                        <li><a href="#plateTab">Plate</a></li>
                        <li><a href="#featuresTab">Features</a></li>
                    </ul>


                    <div id="parsingTab">
                        <div>
                        	<input type="hidden" id="parsingId" autocomplete="off"/>
                            <label for="parsingName">Parsing Name</label>
                            <input type="text" id="parsingName" autocomplete="off"/>
                        </div>
                        <div>
                            <label for="machineName">Machine</label>
                            <input type="text" id="machineName" autocomplete="off"/>
                        </div>
                        <div>
                            <div>
                                <label for="selectedFile">Example File</label>
                                <span id="selectedFile">no file selected</span>
                            </div>
                            <div>
                                <span>Drag and Drop example file or ...</span>
                                <input type="file" id="files" name="files[]" multiple />
                                <button id="getFile">choose file</button>
                            </div>
                        </div>
                        <br/>

                        <div>
                            <label for="parsingDescription">Parsing Description</label>
                            <textarea id="parsingDescription"></textarea>
                        </div>
                        <div>
                            <label for="delimiterList">
                                delimiter
                            </label>

                            <select name="delimiterList" id="delimiterList" size="3">
                                <option value="comma" id="comma">comma</option>
                                <option value="semicolon" id="semicolon">semicolon</option>
                                <option value="tab" id="tab">tab</option>
                            </select>
                        </div>
                        <div>
                            <button id="saveConfigToServer">Save</button>
                        </div>



                    </div>
                    <div id="plateTab">
                        <p>
                            Indicate the cell range that covers data for the first plate
                            in the example file either by highlighting the relevant cells
                            in the table to the left or by indicating the cell range in
                            the field below.
                        </p>
                        <div>
                            <label for="firstPlateCellRange">first plate cell range</label>
                            <input type="text" id="firstPlateCellRange" autocomplete="off"/>
                        </div>
                        <div><button id="applyFirstPlate">Apply</button></div>

                    </div>


                    <div id="featuresTab">
                        <div>
                            <label for="featureList">
                                Feature List
                            </label>

                            <select name="featureList" id="featureList" size="10">
                            </select>
                        </div>
                        <div>
                            <label for="featureCellRange">Cell Range</label>
                            <input type="text" id="featureCellRange" autocomplete="off"/>
                        </div>
                        <div>
                            <label for="featureCategory">Category</label>
                            <input type="text" id="featureCategory" autocomplete="off"/>
                        </div>
                        <div>
                            <label for="featureLevel">Apply to</label>
                            <div id="featureLevel">
                                <div>
                                    <input type="radio" id="wellLevel" name="featureLevel" value="well" />well<br/>
                                </div>
                                <div>
                                    <input type="radio" id="plateLevel" name="featureLevel" value="plate" />plate<br/>
                                </div>
                                <div>
                                    <input type="radio" id="experimentLevel" name="featureLevel" value="experiment" />experiment<br/>
                                </div>
                            </div>
                        </div>

                        <!-- implement after M2 -->
                        <!--<div>
                            <label for="valueType">Feature value type</label>
                            <div id="valueType">
                                <div>
                                    <input type="radio" id="quantitative" name="valueType" value="quantitative" />quantitative<br/>
                                </div>
                                <div>
                                    <input type="radio" id="qualitative" name="valueType" value="qualitative" />qualitative<br/>
                                </div>
                            </div>
                        </div> -->

                        <div>
                            <label for="labelList">
                                label List
                            </label>

                            <select name="labelList" id="labelList" size="5">
                            </select>
                        </div>

                        <div>
                            <button id="newFeature">new feature</button>
                            <button id="saveFeature">save feature</button>
                            <button id="deleteFeature">delete feature</button>
                        </div>
                        <div>
                            <button id="applyFeatures">apply</button>
                        </div>

                    </div>
                </div>

                <div id="plateIDSelection">
                    <div>
                        <div>
                            <label for="experiment">experiment</label>
                            <select id="experiment" name="experiment">
                                <option value="">Experiment</option>
                                 <g:each var="experiment" in="${ExperimentalPlateSet.findAllByOwner(Scientist.get(sec?.loggedInUserInfo(field:'id')))}">
                                    <option value="${experiment.id}">${experiment.name}</option>
                                </g:each>
                            </select>
                        </div>
                        <label for="plateList">
                            Plate List
                        </label>

                        <select name="plateList" id="plateList" size="5">
                        </select>
                    </div>
                    <div>
                        <label for="plateIDMatchMethod">Plate id match by</label>
                        <div id="plateIDMatchMethod">
                            <div>
                                <input type="radio" id="byFeature" name="plateIDMatchMethod" value="byFeature" />plate level feature<br/>
                            </div>
                            <div>
                                <input type="radio" id="byManualEntry" name="plateIDMatchMethod" value="byManualEntry" />manual entry<br/>
                            </div>
                        </div>
                    </div>
                    <br/>
                    <br/>
                    <div id="byFeatureMethod">
                        <p>
                            Select a plate level feature to serve as the plate identifier
                            for matching with the plates defined in the plate editor
                        </p>
                        <label for="plateLevelFeatureList">
                            plateLevelFeatureList
                        </label>

                        <select name="plateLevelFeatureList" id="plateLevelFeatureList" size="5">
                        </select>

                    </div>
                    <div id="byManualEntryMethod">
                        <p>
                            Enter a plate ID for each plate by selecting the plate in the
                            plate list above and then entering the plate id for that plate
                            in the field below and hitting the "set plate id" button.
                        </p>
                        <div>
                            <label for="plateID">plate identifier</label>
                            <select id="plateID" name="plateID"></select>
                        </div>
                        <div>
                            <button id="setPlateID">set plate id</button>
                        </div>
                    </div>
                    <br/>
                    <br/>
                    <br/>
                    <div>
                        <button id="returnToConfig">Go back to parsing configuration</button>
                        <button id="sendImportDataToServer">import and save the data</button>
                    </div>
                </div>

            </div>

        </div>
    </div>

    <g:if env="production">
        <!-- Markup to include ONLY when in production -->
        <g:javascript>
            var hostname = "";      
        </g:javascript>
    </g:if>
    <g:else>
        <g:javascript>
            var hostname = "/capstone";       
        </g:javascript> 
    </g:else>

<asset:javascript src="jquery-1.11.2.min.js"/>
	<asset:javascript src="jquery-ui.js"/>
	<asset:javascript src="jquery.event.drag-2.2.js"/>
	<asset:javascript src="grid/slick.core.js"/>
    <asset:javascript src="grid/slick.grid.js"/>
    <asset:javascript src="grid/slick.autotooltips.js"/>
    <asset:javascript src="grid/slick.cellrangedecorator.js"/>
    <asset:javascript src="grid/slick.cellrangeselector.js"/>
    <asset:javascript src="grid/slick.cellcopymanager.js"/>
    <asset:javascript src="grid/slick.cellselectionmodel.js"/>
    <asset:javascript src="grid/slick.editors.js"/>
    <asset:javascript src="selectize.js"/>
    <asset:javascript src="grid/Grid.js"/>
    <asset:javascript src="parser/FileExaminer.js"/>
    <asset:javascript src="parser/ColorPicker.js"/>
    <asset:javascript src="parser/ImportData.js"/>
    <asset:javascript src="parser/ParsingConfig.js"/>
    <asset:javascript src="parser/parsingConfigCreator.js"/>

