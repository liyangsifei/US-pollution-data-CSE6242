//
/*
$.ajax({
    url: "/feedback/get",
    type: "POST",
    dataType: "json",
    data: JSON.stringify({
        sub: $("q1").val(),
    }),
    contentType: 'application/json;charset=UTF-8',
    success: function (data) {
        render(data);
        console.log(data);
    },
    error: function (data) {
        alert("It looks like that dataset hasn't been downloaded yet, or there was a problem loading it. Please refer to the README for further instructions.");
    }
})
*/
function submit_options(name)
    {
        $.ajax({
            url: "/getfeedback",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({
                Q1 : $(".rating:checked").val(),
                Suggestion: $("#text1").val()
            }),

            contentType: 'application/json;charset=UTF-8',
            success: function (res) {
                //console.log(res);
                //render(res);
                alert("Submit feedback success! Redirect to homepage");
                document.location.href = '/'
            },
            error: function (res) {
                //console.log(res)
                alert("Error!");
            }
        });

    }
