		$(document).ready(function() {

			$('input[type=file]').bootstrapFileInput();

			// jQplot: Enable plugins like cursor and highlighter by default.
			$.jqplot.config.enablePlugins = true;
			// don't show the to image button.
			$.jqplot._noToImageButton = true;

			$("#csvfile").on("change", function() {
				var myfile = $("#csvfile")[0].files[0];
				$("#csvfile").attr("disabled", "disabled");
				$("#csvform").find("a").removeClass("btn-primary");
				$("label[for$='csvfile']").text('File uploaded:');
				var json = Papa.parse(myfile, {
					header: true,
					skipEmptyLines: true,
					dynamicTyping: true,
					complete: function(results) {
							console.log("Dataframe:", JSON.stringify(results.data));
							console.log("Column names:", results.meta.fields);
							console.log("Errors:", results.errors);
							// stop if error
							if (results.errors.length != 0) {
								alert("Something is wrong with this file");
								throw new Error("Something is wrong with this file");
							}
							// make the df in columns format
							var df = results.data;
							var columns = results.meta.fields;
							var dfcolumns = {};
							for (i = 0; i < columns.length; i++) {
								var column = [];
								var colname = columns[i];
								for (j = 0; j < df.length; j++) {
									column.push(df[j][colname]);
								}
								dfcolumns[colname] = column;
							}
							// find numeric columns
							var isNumeric = [];
							for (var key in dfcolumns) {
								var col = dfcolumns[key];
								var i = 0;
								while (col[i] == "") {
									i++
								}
								isNumeric.push(typeof(col[i]) == "number")
							}
							// show the column selectors
							$("#selectcolumns").show()
								// show the 'report' block
							$('#divreport').show();
							// create the table
							jsontotable("#dataTable", df, columns, columns, "classy");
							// create the selection lists
							var sels = $('#selcolumn1, #selcolumn2');
							// set the size
							if (columns.length < 5) {
								var size = columns.length;
							} else {
								var size = 5;
							}
							sels.attr('size', size);
							$(columns).each(function(index, item) {
								if (isNumeric[index] && columns[index] != "") {
									sels.append($("<option>").attr('value', index).text(item));
								} else {
									sels.append($("<option>").attr('value', index).text(item).attr('disabled', 'disabled'));
								}
							});
							// onchange action
							var selids = ['#selcolumn1', '#selcolumn2'];
							var colors = ['blue', 'green'];
							$(selids).each(function(selindex, sel) {
								$(sel).change(function() {
									var selectedIndices = [$("#selcolumn1").prop('selectedIndex'), $("#selcolumn2").prop('selectedIndex')];
									if (selectedIndices[0] == selectedIndices[1]) {
										$(selids[1 - selindex] + ' option:selected').prop('selected', false);
										selectedIndices[1 - selindex] = -1;
										$("#reportbutton").attr("disabled", "disabled").removeClass("btn-primary").addClass("btn-danger");
										$('#xyjqplot').hide();
									}
									if (selectedIndices[0] != -1 && selectedIndices[1] != -1) {
										$("#reportbutton").attr("disabled", false).removeClass("btn-danger").addClass("btn-primary");
										$('#xyjqplot').show();
										plot().replot();
									}
									// emphasize the selected column
									$('#dataTable tbody tr').each(function(i, item) {
										$(item).find('td').each(function(index, td) {
											if (index == selectedIndices[selindex]) {
												$(td).css('color', colors[selindex]).css('font-size', '17px');
											} else {
												if (index != selectedIndices[1 - selindex]) {
													$(td).css('color', 'gray').css('font-size', '15px');
												}
											}
										});
									});
								});
							});

							// plot
							function plot() {
								var col1 = $("#selcolumn1 option:selected").text();
								var col2 = $("#selcolumn2 option:selected").text();
								var x = dfcolumns[col1];
								var y = dfcolumns[col2];
								var data = [];
								for (i = 0; i < x.length; i++) {
									data.push([x[i], y[i]]);
								}
								// jqplot plot
								var jq = $.jqplot('xyjqplot', [data], {
									title: 'Plot of ' + col2 + ' vs ' + col1,
									series: [{
										color: '#5FAB78',
										showLine: false
									}],
									axes: {
										xaxis: {
											label: col1
										},
										yaxis: {
											label: col2,
											labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
											labelOptions: {
												fontFamily: 'Helvetica',
												fontSize: '12pt'
											}
										}
									},
									highlighter: {
										show: true,
										sizeAdjust: 7.5
									},
									seriesDefaults: {
										trendline: {
											show: true,
											color: 'red',
											linePattern: 'dashed'
										}
									}
								});
								return (jq)
							}

							// generate report
							$("#reportbutton").on("click", function() {
								//disable the button to prevent multiple clicks
								$("#reportbutton").attr("disabled", "disabled");
								// get the data
								var col1 = $("#selcolumn1 option:selected").text();
								var col2 = $("#selcolumn2 option:selected").text();
								var dflist = {};
								dflist[col1] = dfcolumns[col1];
								dflist[col2] = dfcolumns[col2];
								$.ajax({
									contentType: "application/json",
									processData: false,
									url: "/data",
									type: "PUT",
									data: JSON.stringify({
										_dat: JSON.stringify(dflist), 
										_conflevel: Number($('#conflevel').val()),
										_filetype: $('input[name="optradio"]:checked').val()
									}),
									success: function(base64) {
										$('#download').attr("href", base64).text("Download").attr("download", "report." + $('input[name="optradio"]:checked').attr("data-value")); 
									},
									error: function(jqXHR, textStatus, errorThrown){
										console.log(jqXHR);
										console.log(textStatus);
										console.log(errorThrown);
									},
									dataType: "text"
								});

							});

						} // end of Papa Parse callback
				}); // end of Papa Parse

			}); // end of onchange #csvfile


		})
