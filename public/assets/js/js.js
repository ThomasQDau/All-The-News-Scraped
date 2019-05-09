$(document).ready(function () {

    let articleId = '';
    $('#NoteInput').hide();

    $(document).on('click', '.noteBtn', function () {
        $('#NoteInput').show();
        articleId = $(this).attr('data-id');
        console.log(articleId);
    });

    $(document).on('click', '#submit', function () {
        const note = $('#body').val();
        const id = '#' + articleId;
        $('#body').val('');
        $(id).text(note);
        $.post("/",
            {
                id: articleId,
                note: note
            }, function (data, status) {
                console.log("Data: " + data + "\nStatus: " + status);
                $('#NoteInput').hide();
            });
    })
})

