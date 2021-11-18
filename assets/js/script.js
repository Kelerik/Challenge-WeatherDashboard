// update all the date elements
$("*[data-date]").each(function (index) {
   $(this).text(moment().add(index, "days").format("MM/DD/YYYY"));
});
