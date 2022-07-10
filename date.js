export default { getDateP, getDay };

function getDateP (){
    let options = { weekday: 'long', day: 'numeric', month: 'long' };
    let today  = new Date().toLocaleDateString ("es-MX", options);

    return today;
}

function getDay () {
    let options = { weekday: 'long' };
    let today  = new Date().toLocaleDateString ("es-MX", options);

    return today;
}