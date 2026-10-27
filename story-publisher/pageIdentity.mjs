// Workspace labels requested by the owner; not claims about approved Facebook names.
export const pilotPageNames = Object.freeze({
 '104625669131300':'Mroczne Dziedzictwo',
 '664859260049031':'Ukryty Testament',
 '862640380267439':'Sekrety Rodziny',
 '783405241533648':'Za Zamkniętymi Drzwiami',
 '107489462228044':'Gorzkie Dziedzictwo'
});
export function pageDisplayName(id,facebookName){return pilotPageNames[id]||facebookName;}
