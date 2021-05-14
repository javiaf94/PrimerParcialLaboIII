window.addEventListener("load", function(){
    getDatos();
});

function getDatos(){
    var peticionHttp = new XMLHttpRequest();

    peticionHttp.onreadystatechange = function(){
        if(peticionHttp.readyState == 4 && peticionHttp.status == 200){            
                cargarDatosTabla("tCuerpo", JSON.parse(peticionHttp.responseText));                            
        }        
    }
    peticionHttp.open("GET","http://localhost:3000/materias",true);    
    peticionHttp.send();
}


function cargarDatosTabla(tCuerpo, datosJSON){
    
    
    var cuerpo = $(tCuerpo);
    
    for(var i= 0; i<datosJSON.length;i++)
    {
        var row = document.createElement("tr");
        cuerpo.appendChild(row);

        row.setAttribute("id", JSON.stringify(datosJSON[i].id));
        
        var tdNombre = document.createElement("td");
        row.appendChild(tdNombre);
        var txtNombre = document.createTextNode(datosJSON[i].nombre);
        tdNombre.appendChild(txtNombre);
        
        var tdCuatrimestre = document.createElement("td");
        row.appendChild(tdCuatrimestre);
        var txtApellido = document.createTextNode(datosJSON[i].cuatrimestre);
        tdCuatrimestre.appendChild(txtApellido);
        
        var tdFecha = document.createElement("td");
        row.appendChild(tdFecha);
        var txtFecha = document.createTextNode(datosJSON[i].fechaFinal);
        tdFecha.appendChild(txtFecha);
        
        var tdTurno = document.createElement("td");
        row.appendChild(tdTurno);
        var txtTurno = document.createTextNode(datosJSON[i].turno);
        tdTurno.appendChild(txtTurno);
        
        row.addEventListener("dblclick",mostrarFila);
    }
}


function mostrarFila(e){
        
    var fila = e.target.parentNode;    
    
    $("divContDatos").setAttribute("visible", "1");

    $("txtNombre").setAttribute("class","sinError");    
    $("txtFecha").setAttribute("class","sinError");
    
    
    var hijo = fila.firstChild
    $("txtNombre").value = hijo.textContent;
    
    hijo = hijo.nextSibling;
    switch(hijo.textContent)
    {
        case "1":
            $("selectCuatri").value ="1" ;
            break;
        case "2":            
            $("selectCuatri").value ="2" ;
            break;
        case "3":
            $("selectCuatri").value ="3" ;
            break;
        case "4":
            $("selectCuatri").value ="4" ;
            break;
    }
    
    //convierto fecha a yyyy-mm-dd para que el Date la reconozca.
    hijo = hijo.nextSibling;
    var fecha = hijo.textContent;
    if(fecha[2] == "/" || fecha[4] == "/"){
        var fechaSplit = fecha.split("/");
        var fecha = fechaSplit[2]+"-"+fechaSplit[1]+"-"+fechaSplit[0];
    }
    $("txtFecha").value = fecha;        


    hijo = hijo.nextSibling;
    if(hijo.textContent == "Mañana"){
        $("radioMañ").checked = true;
    }
    else{
        $("radioNoch").checked = true;
    }

   $("btnSalir").onclick = function()
   {
       ocultarDiv($("divContDatos"));
   }
   
   $("btnModificar").onclick=function(){
       
        var flagError = 0;

        if( $("txtNombre").value.length <=6)
        {
            flagError = 1;
        }
        else
        {
            $("txtNombre").setAttribute("class","sinError");
        }

        var fechaDatos = new Date($("txtFecha").value);
        var fechaActual = Date.now();
        if( fechaActual > fechaDatos)
        {                   
            flagError = 1;
            $("txtFecha").setAttribute("class","conError");
        }
        else
        {
            $("txtFecha").setAttribute("class","sinError");
        }

        if($("radioMañ").checked == false && $("radioNoch").checked == false)
        {
            flagError = 1;
            $("labelMañana").setAttribute("class","labelError");
            $("labellabelNoche").setAttribute("class","labelError");
        }
        else
        {
            $("labelMañana").setAttribute("class","labelOK");
            $("labelNoche").setAttribute("class","labelOK");
        }
        if(flagError ==0)
        {
            var turno = "";
            if($("radioMañ").checked){
                turno = "Mañana";
            }
            else{
                turno = "Noche";
            }
            var materiaJSON = {id: fila.id, nombre: $("txtNombre").value, cuatrimestre: $("selectCuatri").value, fechaFinal: $("txtFecha").value, turno: turno};            
            modificarMateria(materiaJSON);            
        }
    }

    $("btnEliminar").onclick=function()
     {
         var idJSON = {id: fila.id};        
         eliminarPersona(idJSON);     
     }
  }
    

 function modificarMateria(objJSON){
    var peticionHttp = new XMLHttpRequest();

    peticionHttp.onreadystatechange = function(){
        $("spinner").setAttribute("class","visible");
        if(peticionHttp.readyState == 4 )
        {  
            $("spinner").setAttribute("class","invisible");         
            if( peticionHttp.status == 200 && JSON.parse(peticionHttp.responseText).type == "ok")
            {            
                actualizarModificacionTabla(objJSON);            
                ocultarDiv($("divContDatos"));
            }
        }        
                
    }    
    peticionHttp.open("POST","http://localhost:3000/editar",true);    
    peticionHttp.setRequestHeader("Content-type","application/json");
    var materiaString = JSON.stringify(objJSON);
    peticionHttp.send(materiaString);
}

function actualizarModificacionTabla(objJSON) 
{
    var fila = $(objJSON.id);    
    var hijo = fila.firstChild;
    hijo.innerHTML = objJSON.nombre;
    hijo = hijo.nextSibling;
    hijo.innerHTML = objJSON.cuatrimestre;
    hijo = hijo.nextSibling;
    hijo.innerHTML = objJSON.fechaFinal;
    hijo = hijo.nextSibling;
    hijo.innerHTML = objJSON.turno;
}

 function eliminarPersona(idJSON){
    var peticionHttp = new XMLHttpRequest();

    peticionHttp.onreadystatechange = function()
    {
        $("spinner").setAttribute("class","visible");
        if(peticionHttp.readyState == 4)
        {
            $("spinner").setAttribute("class","invisible");
        }
        if(peticionHttp.status == 200 && JSON.parse(peticionHttp.responseText).type == "ok")
        {               
            var fila = $(idJSON.id);
            var parent = fila.parentNode;
            parent.removeChild(fila);
            ocultarDiv($("divContDatos"));
        }  
    }
    peticionHttp.open("POST","http://localhost:3000/eliminar",true);    
    peticionHttp.setRequestHeader("Content-type","application/json");
    var idString = JSON.stringify(idJSON);
    peticionHttp.send(idString);
}
        

function $(id){
    return document.getElementById(id);
}

function ocultarDiv(divDatos){
    divDatos.setAttribute("visible", "0");
}

function mostrarDiv(divDatos){
    divDatos.setAttribute("visible", "1");
}
