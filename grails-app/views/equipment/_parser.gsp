<%@ page import="edu.harvard.capstone.parser.Equipment" %>


    <div>selected cells = <span id="selectedCells"></span></div>

    <div class="container-fluid max-height no-overflow" id="content">
        <div class="row max-height">

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
                            <label for="platesPerFile">Plate(s) per file</label>
                            <div id="platesPerFile">
                                <input type="radio" id="singlePlate" name="numPlates" value="single" />single<br />
                                <input type="radio" id="multiplePlates" name="numPlates" value="multiple" />multiple<br />
                            </div>
                        </div>
                        <br/>
                        <div>
                            <label for="valuesPerPlate">Value(s) per well</label>
                            <div id="valuesPerPlate">
                                <input type="radio" id="singleValue" name="numValues" value="single" />single<br />
                                <input type="radio" id="multipleValues" name="numValues" value="multiple" />multiple<br />
                            </div>
                        </div>
                        <br/>
                        <div>
                            <label for="wellValueFormat">Well value format</label>
                            <div id="wellValueFormat">
                                <input type="radio" id="gridFormat" name="format" value="grid" />grid<br />
                                <input type="radio" id="rowFormat" name="format" value="row" />row per well<br />
                            </div>
                        </div>
                        <div>
                            <label for="delimiterList">
                                delimiter
                            </label>

                            <select name="delimiterList" id="delimiterList" size="3">
                                <option value="comma">comma</option>
                                <option value="semicolon">semicolon</option>
                                <option value="tab">tab</option>
                            </select>
                        </div>
                        <div>
                            <button id="saveConfig">save</button>
                            <button id="saveConfigToServer">save to server</button>
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
                            <button id="deleteFeature">delete</button>
                        </div>
                        <div>
                            <button id="applyFeatures">apply</button>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>

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
    <asset:javascript src="grid/Grid.js"/>
    <asset:javascript src="parser/FileExaminer.js"/>
    <asset:javascript src="parser/ColorPicker.js"/>
    <asset:javascript src="parser/ImportData.js"/>
    <asset:javascript src="parser/ParsingConfig.js"/>
    <asset:javascript src="parser/parsingConfigCreator.js"/>

