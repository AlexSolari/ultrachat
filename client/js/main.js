var Global = {};
function displayMsg(text)
{
    $("#chatSection").prepend(text);
}
function addMsg(text, login, checkHTML)
{
    if (text.length == 0) return;
    if (checkHTML) 
    {
	var isNotClear = (/[<>]/).test(text);
	if (isNotClear) 
	{
		alert("'<' and '>' are not allowed");
		return;
	}
    }
    var time = new Date();
    var isNotClear = (/[<,>]/).test(text);
	if (Notification && isNotClear) 
	{
		var regExp = /'([\/\w.]+)'/;
		var newstr = regExp.exec(text);
		switch (Notification.permission.toLowerCase()){
                case 'granted':
                    new Notification('ULTRACHAT',
                        {
                            tag: 'UChat_newMessage',
                            body: login + ": (emoticon)",
                            icon: newstr[1]
                        }
                    );
            }
	}
	else switch (Notification.permission.toLowerCase()){
                case 'granted':
                    new Notification('ULTRACHAT',
                        {
                            tag: 'UChat_newMessage',
                            body: login + ' : ' + text,
                            icon: "icon.png"
                        }
                    );
            }
    displayMsg("<i>(" + time.toLocaleTimeString() + ") </i><span><b>"+login+"</b> : "+text+"</span><br>");
}
function initSocket() {
    socket.on("msg", function(container)
    {
        addMsg(container.text, container.login, container.checkHTML);
    });
    socket.on("userConnected", function(login)
    {
        var user = document.createElement("li");
        user.innerHTML = "<strong>"+login+"</strong>";
        user.id = "user-"+login;
        $("#users").append(user);
    });
    socket.on("userDisconnected", function(login)
    {
        $("#user-"+login).remove();
    });
    socket.on("sendConnectedUsers", function(connectedUsers) {
        for(var counter = 0; counter < connectedUsers.length; counter++)
        {
            var user = document.createElement("li");
            user.innerHTML = "<strong>"+connectedUsers[counter]+"</strong>";
            user.id = "user-"+connectedUsers[counter];
            $("#users").append(user);
        }
    });
    socket.emit("succesfullyConnected", Global.login);
}
$(function() {
    var regions = [
        "Автономная республика Крым",
        "Винницкая область",
        "Волынская область",
        "Днепропетровская область",
        "Донецкая область",
        "Житомирская область",
        "Закарпатская область",
        "Запорожская область",
        "Ивано-Франковская область",
        "Киевская область",
        "Кировоградская область",
        "Луганская область",
        "Львовская область",
        "Николаевская область",
        "Одесская область",
        "Полтавская область",
        "Ровенская область",
        "Сумская область",
        "Тернопольская область",
        "Харьковская область",
        "Херсонская область",
        "Хмельницкая область",
        "Черкасская область",
        "Черниговская область",
        "Черновицкая область"
    ];
    window.socket = io("https://ultrachat-alexsolari.c9.io");
    socket.on("loginValidation", function(result){
        var field = $("#inputLoginRegister");
        if (field.val().length == 0) {
            field.removeClass("invalid");
            field.removeClass("valid");
            return;
        }
        var exp = /^[A-Za-zА-Яа-яЁёІіЄє]+$/;
        if (result && exp.test(field.val()))
        {
            field.removeClass("invalid");
            field.addClass("valid");
        }
        else {
            field.removeClass("valid");
            field.addClass("invalid");
        }
    });
    socket.on("signInResult", function(result){
        if (result)
        {
            $("#loginForm").stop().slideToggle(500);
        	$("main").stop().slideToggle(500);
        	Global.login = $("#inputLogin").val();
        	$("#self").html("<strong>"+Global.login+"</strong>");
        	$("#smilesMenu").fadeIn();
        	initSocket();    
        }
        else alert("Wrong login or password");
    });

    Notification.requestPermission();
    $( "#inputRegionRegister" ).autocomplete({
        source: regions
    });
    window.onbeforeunload = confirmExit;
    function confirmExit()
    {
        if (Global.login == undefined) return;
        var container = {
            text : Global.login + " disconnected",
            login : "SERVER",
            checkHTML: false
        };
        socket.emit("send", container);
        socket.emit("disconnect");
    }
    window.onkeydown = function(e)
    {
        var input = $("#inputSection");
        if (e.keyCode == 13)
        {
            var container = {
                text : input.val(),
                login : Global.login,
                checkHTML: false
            };
            socket.emit("send", container);
            input.val("");
        }
    };
    $("#inputLoginRegister").on("input", function() {
       socket.emit("validateLogin", { login: $(this).val() }); 
    });
    $("#aboutPanel").on("mousemove", function()
    {
        $(this).stop().animate({top: "-10px"}, 500);
    }).on("mouseout",function()
    {
        $(this).stop().animate({top: "-35px"},500);
    });
    $("#smilesMenu").on("mousemove", function()
    {
        $(this).stop().animate({right: "-10px"}, 500);
    }).on("mouseout",function()
    {
        $(this).stop().animate({right: "-160px"},500);
    });
    $("#secretKitten").on("mousemove", function()
    {
        $(this).stop().animate({left: "-10px"}, 500)
    }).on("mouseout",function()
    {
        $(this).stop().animate({left: "-365px"},500);
    });
    $("#loginBtn").click(function ()
    {
	var exp2 = /^[A-Za-zА-Яа-яЁёІіЄє]+$/;
	        if (exp2.test($("#inputLogin").val()))
	        {
	            if ($("#inputPassword").val().length > 0)
	            {
            		socket.emit("signInRequest", {
            		    login: $("#inputLogin").val(),
            		    pass: $("#inputPassword").val()
            		})
		        }
		    else alert("Password cant be empty");
        	}
        	else alert("Invalid login");	
    });
    $("#regBtn").click(function ()
    {
        var exp = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        var exp2 = /^[A-Za-zА-Яа-яЁёІіЄє]+$/;
        if (exp2.test($("#inputLoginRegister").val()))
        {
            if ($("#inputLoginRegister").hasClass("valid"))
            {
                if ($("#inputPasswordRegister").val().length > 0)
                {
                    if (exp.test($("#inputEmailRegister").val()))
                    {
                        if ($("#inputEmailRegisterConfirm").val() == $("#inputEmailRegister").val())
                        {
                            if($("#inputPasswordRegisterConfirm").val() == $("#inputPasswordRegister").val())
                            {
                                $("#regForm").stop().slideToggle(500);
                                $("main").stop().slideToggle(500);
                                Global.login = $("#inputLoginRegister").val();
                                $("#smilesMenu").fadeIn();
                                socket.emit("addUsetToDB", {
                                    login: $("#inputLoginRegister").val(),
                                    mail: $("#inputEmailRegister").val(),
                                    region: $("#inputRegionRegister").val(),
                                    pass: $("#inputPasswordRegister").val()
                                });
                                initSocket();
                            }
                            else alert("Passwords are not match");
                        }
                        else alert("Mails are not match");
                    }
                    else alert("Invalid mail");
                }
                else alert("Password cant be empty");
            }
            else alert("This username is already taken");
        } else alert("Invalid login");
        

    });
    $("#gotoReg").click(function ()
    {
        $("#regForm").stop().slideToggle(500);
        $("#loginForm").stop().slideToggle(500);
    });
    $("#regCancel").click(function ()
    {

        $("#loginForm").stop().slideToggle(500);
        $("#regForm").stop().slideToggle(500);
    });
    $("#sendSection").click(function()
    {
        var input = $("#inputSection");
        var container = {
            text : input.val(),
            login : Global.login,
            checkHTML: false
        };
        socket.emit("send", container);
        input.val("");
    });
    $('#smilesMenu>ul>li').click(
        function() {
            $(this).parent().children('li').children('ul').slideUp('');
            $(this).find('ul:first').stop(true, true);
            $(this).find('ul:first').slideDown();
        }
    );
    $(".smilesToAdd li a").click(
        function ()
        {
            var container = {
                text : "<img src='smiles/"+$(this).attr('class') + ".png'>",
                login : Global.login,
                checkHTML: false
            };
            socket.emit("send", container);
        }
    );
});
/**
 * Created by Cheese on 20.04.2015.
 */
