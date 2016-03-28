package edu.harvard.capstone.editor

class WellCompound {
	Long id;
	Well well;
	Compound compound;
	Unit unit;
	String amount;
	
	enum Unit{
		ML, PERCENT, MG, MOL
	}
	
}
