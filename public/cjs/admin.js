//global store 
var subView //view name
var result_val = [] //score data

$(document).ready(function(){

    //Delete User request
    var trs = null
    $('.container-fluid').on('click','.removeUsers', () => {
        console.log(this.activeElement)
        trs = this.activeElement
        $.post('/deleteUser',{
            id: $(this.activeElement).attr('id')
        }).done(function(res){
            if(res){
                var datatable = $('#dataTable').DataTable()

                datatable.row($(trs).closest("tr")).remove().draw()
            }
        })
    })

    //Add User request
    $('.submitBtn').click( () => {
        nid = $('#id').val()
        nname = $('#name').val()
        if (nid !== "" && nname !== ""){
            $.post('/addUser',{
            id: nid,
            name:nname
             }).done( (res) => {
                if(res.error){
                    alert("Get data false")
                } else {
                    $('#adduserModal').modal('toggle')
                    $('#container').empty()
                    $('#container').append(res)
                    $('.table').DataTable().draw
                }
            })
        }
    })

    //Ajax load view
    $('.c-control').click(function(){
        if(subView !== $(this).data('value')){
            var control = this
            $.get($(this).attr('href')).done( (res) =>{
                $('#container').empty()
                $('#container').append(res)
                $('.table').DataTable()
                subView = $(control).data('value') /*** */
            })
        }
        return false
    })

    $('.container-fluid').on('click','.change-status', () => {
        var status = $('#change-status').data('value');
        console.log("get "+ status)
        if( status == "Cancel") {
            $.post("/admin/status",{
                name: $('#names').val(),
                vote_state: "stop"
            }).done( (res) =>{
                $('#container').empty()
                $('#container').append(res)
            })
        } else {
            $.post("/admin/status",{
                name: $('#names').val(),
                vote_state: "run"
            }).done( (res) =>{
                $('#container').empty()
                $('#container').append(res)
            })
        }
    })
    
    $.get('admin/dashboard').done( (res) =>{
        $('#container').empty()
        $('#container').append(res)
        $('.table').DataTable()
        subView = 'dashboard' /*** */
    })

});

var lock = false
// Ajax done
$(document).ajaxStop( () => {
    if (lock == false) {
        switch (subView) {
            case "dashboard":
                //console.log("d")
                {
                    $.getJSON('/admin/votedata', (res) => {
                        lock = true // dont run again

                        // Set new default font family and font color to mimic Bootstrap's default styling
                        Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
                        Chart.defaults.global.defaultFontColor = '#292b2c';
    
                        // common config
                        var chart_config = {
                            type: 'bar',
                            data: {
                                labels: ["A", "B", "C", "D"],
                                datasets: [{
                                label: "Vote Result",
                                backgroundColor: "rgba(2,117,216,1)",
                                borderColor: "rgba(2,117,216,1)",
                                data: [7, 10, 15, 20],
                                }],
                            },
                            options: {
                                scales: {
                                xAxes: [{
                                    time: {
                                    unit: 'Answers'
                                    },
                                    gridLines: {
                                    display: false
                                    },
                                    ticks: {
                                    maxTicksLimit: 6
                                    }
                                }],
                                yAxes: [{
                                    ticks: {
                                    min: 0,
                                    max: 25,
                                    maxTicksLimit: 5
                                    },
                                    gridLines: {
                                    display: true
                                    }
                                }],
                                },
                                legend: {
                                display: false
                                }
                            }
                        }
                        // Bar Chart Example
                        var ctx1 = document.getElementById("barchart1");
                        var chart1_config = jQuery.extend(true, {}, chart_config)
                        chart1_config.data.datasets[0].data = res.TC1
                        var myLineChart1 = new Chart(ctx1,chart1_config);
    
                        var ctx2 = document.getElementById("barchart2");
                        var chart2_config = jQuery.extend(true, {}, chart_config)
                        chart2_config.data.datasets[0].data = res.TC2
                        var myLineChart2 = new Chart(ctx2,chart2_config);
    
                        var ctx3 = document.getElementById("barchart3");
                        var chart3_config = jQuery.extend(true, {}, chart_config)
                        chart3_config.data.datasets[0].data = res.TC3
                        var myLineChart3 = new Chart(ctx3,chart3_config);
    
                        var ctx4 = document.getElementById("barchart4");
                        var chart4_config = jQuery.extend(true, {}, chart_config)
                        chart4_config.data.datasets[0].data = res.TC4
                        var myLineChart4 = new Chart(ctx4,chart4_config);
                    })
    
                    $('.ui.dropdown').dropdown({
                        onChange: (val) => {
                            $.get('admin/dashboard/'+ val).done( (res) =>{
                                $('#container').empty()
                                $('#container').append(res)
                                $('.table').DataTable()
                                subView = 'dashboard' /*** */
                            })
                        }
                    });
                }
                
                break;
            case "users":
                //console.log("u")
                break;
            case "status":
                //console.log("s")
                break;
            case "unattend":
                {
                    $('.ui.dropdown').dropdown({
                        onChange: (val) => {
                            $.get('admin/unattend/'+val).done( (res) =>{
                                $('#container').empty()
                                $('#container').append(res)
                                $('.table').DataTable()
                                subView = 'unattend' /*** */
                            })
                        }
                    })
                }
                break;
        }
    } else {
        lock = false
    } 
    
})

