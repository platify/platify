<!-- This template renders a drop down after a template size is selected -->
<g:select id="plateSelect" name="plate.id" from="${filteredTemplateList}" optionKey="id" 
	optionValue="${{it.name + ' (id:' + it.id + ')'}}"
	onchange="onPlateSelectChange(this)" value="${plateSetInstance?.plate?.id}" class="form-control many-to-one"/> 