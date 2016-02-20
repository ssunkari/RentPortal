function onDelete(row_id) {
    purchaseDate = $(row_id).find('td:eq(0)').text();
    user = $(row_id).find('td:eq(1)').text();
    utilType = $(row_id).find('td:eq(2)').text();
    url = '/expenses/delete?user=' + user + '&utilType=' + utilType + '&purchaseDate=' + purchaseDate;
    $.ajax({
        url: url,
        type: 'DELETE'
    }).done(function () {
        alert('successfully deleted');
        $(row_id).remove();
    });
}