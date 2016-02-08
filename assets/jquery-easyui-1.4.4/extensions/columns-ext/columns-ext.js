/**
 * The extending functionalities on datagrid columns.
 */
(function($){
	$.extend($.fn.datagrid.defaults, {
		onBeforeDragColumn: function(field){},
		onStartDragColumn: function(field){},
		onStopDragColumn: function(field){},
		onBeforeDropColumn: function(toField, fromField, point){},
		onDropColumn: function(toField, fromField, point){}	// point: 'before','after'
	});
	$.extend($.fn.treegrid.defaults, {
		onBeforeDragColumn: function(field){},
		onStartDragColumn: function(field){},
		onStopDragColumn: function(field){},
		onBeforeDropColumn: function(toField, fromField, point){},
		onDropColumn: function(toField, fromField, point){}	// point: 'before','after'
	});
	$.extend($.fn.datagrid.methods, {
		_getPluginName: function(jq){
			if (jq.data('treegrid')){
				return 'treegrid';
			} else {
				return 'datagrid';
			}
		},
		freezeColumn: function(jq, field){
			return jq.each(function(){
				var dg = $(this);
				var plugin = dg.datagrid('_getPluginName');
				var fields = dg[plugin]('getColumnFields');
				var index = $.inArray(field, fields);
				if (index >= 0){
					var col = dg[plugin]('getColumnOption', field);
					col.originalIndex = $.inArray(field, fields);
					dg[plugin]('moveColumn', {
						field: field
					});					
				}
			})
		},
		unfreezeColumn: function(jq, field){
			return jq.each(function(){
				var dg = $(this);
				var plugin = dg.datagrid('_getPluginName');
				var fields = dg[plugin]('getColumnFields', true);
				var index = $.inArray(field, fields);
				if (index >= 0){
					var col = dg[plugin]('getColumnOption', field);
					var toFields = dg[plugin]('getColumnFields', false);
					dg[plugin]('moveColumn', {
						field: field,
						before: toFields[col.originalIndex]
					});
				}
			})
		},
		/**
		 * move the column
		 * $('#dg').datagrid('moveColumn', {
		 *		field: 'itemid',
		 *		before: 'listprice'
		 *		// after: 'listprice'
		 * })
		 */
		moveColumn: function(jq, param){
			return jq.each(function(){
				var dg = $(this);
				var plugin = dg.datagrid('_getPluginName');
				var opts = dg[plugin]('options');
				var toField = param.before || param.after;
				var col = dg[plugin]('getColumnOption', param.field);
				if (col){
					var index = getIndex(param.field, true);
					if (index >= 0){
						opts.frozenColumns[0].splice(index, 1);
						if (!toField){
							opts.columns[0].push(col);
							recreate();
							return;
						}
					} else {
						index = getIndex(param.field, false);
						opts.columns[0].splice(index, 1);
						if (!toField){
							if (opts.frozenColumns[0]){
								opts.frozenColumns[0].push(col);								
							} else {
								opts.frozenColumns[0] = [col];
							}
							recreate();
							return;
						}
					}
					var toIndex = getIndex(toField, true);
					if (toIndex >= 0){
						opts.frozenColumns[0].splice(toIndex + (param.before?0:1), 0, col);
					} else {
						toIndex = getIndex(toField, false);
						opts.columns[0].splice(toIndex + (param.before?0:1), 0, col);
					}
					recreate();
				}
				function getIndex(field, frozen){
					var fields = dg[plugin]('getColumnFields', frozen);
					return $.inArray(field, fields);
				}
				function recreate(){
					var url = opts.url;
					opts.url = null;
					var data = dg[plugin]('getData');
					dg[plugin]({
						data: null
					});
					dg[plugin]('loadData', data);
					opts.url = url;
				}
			})
		}
	})
})(jQuery);

(function($){
	function initCss(){
		var css = $('#datagrid-columnmoving');
		if (!css.length){
			$('head').append(
				'<style id="datagrid-columnmoving">' +
				'.datagrid-header .datagrid-moving-left{border-left:1px solid red}' +
				'.datagrid-header .datagrid-moving-left .datagrid-cell{margin-left:-1px}' +
				'.datagrid-header .datagrid-moving-right{border-right:1px solid red;border-left:0}' +
				'</style>'
			);
		}
	}

	function moving(target){
		var plugin = $(target).datagrid('_getPluginName');
		var opts = $(target)[plugin]('options');
		var cells = $(target).datagrid('getPanel').find('div.datagrid-header td[field]:not(:has(.datagrid-filter-c))');
		cells.draggable({
			revert: true,
			cursor: 'pointer',
			edge: 5,
			proxy:function(source){
				var p = $('<div class="tree-node-proxy tree-dnd-no" style="position:absolute;border:1px solid #ff0000"/>').appendTo('body');
				p.html($(source).text());
				p.hide();
				return p;
			},
			onBeforeDrag: function(e){
				var field = $(this).attr('field');
				if (opts.onBeforeDragColumn.call(target, field) == false){return false;}
				if (e.which != 1){return false;}
				e.data.startLeft = $(this).offset().left;
				e.data.startTop = $(this).offset().top;
			},
			onStartDrag: function(e){
				opts.onStartDragColumn.call(target, $(this).attr('field'));
				$(this).draggable('proxy').css({
					left:-10000,
					top:-10000
				});
			},
			onStopDrag: function(){
				opts.onStopDragColumn.call(target, $(this).attr('field'));
			},
			onDrag: function(e){
				var x1=e.pageX,y1=e.pageY,x2=e.data.startX,y2=e.data.startY;
				var d = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
				if (d>3){	// when drag a little distance, show the proxy object
					$(this).draggable('proxy').show().css({
						left: e.pageX+15,
						top: e.pageY+15
					});
					this.x = e.pageX;
					this.y = e.pageY;
				}
				return false;
			}
		}).droppable({
			accept: 'td[field]:not(:has(.datagrid-filter-c))',
			onDragOver: function(e, source){
				$(source).draggable('proxy').removeClass('tree-dnd-no').addClass('tree-dnd-yes');
				var width = $(this).outerWidth();
				var x = $(this).offset().left;
				var y = $(this).offset().top;
				$(this).removeClass('datagrid-moving-left datagrid-moving-right');
				if (source.x < x + width/2){
					$(this).addClass('datagrid-moving-left');
				} else {
					$(this).addClass('datagrid-moving-right');
				}
			},
			onDragLeave: function(e, source){
				$(source).draggable('proxy').removeClass('tree-dnd-yes').addClass('tree-dnd-no');
				$(this).removeClass('datagrid-moving-left datagrid-moving-right');
			},
			onDrop: function(e, source){
				var fromField = $(source).attr('field');
				var toField = $(this).attr('field');
				var inserted = $(this).hasClass('datagrid-moving-left');
				$(this).removeClass('datagrid-moving-left datagrid-moving-right');
				
				var point = inserted ? 'before' : 'after';
				if (opts.onBeforeDropColumn.call(target, toField, fromField, point) == false){
					return;
				}
				var param = {field: fromField};
				param[point] = toField;
				$(target)[plugin]('moveColumn', param);
				$(target)[plugin]('columnMoving');
				opts.onDropColumn.call(target, toField, fromField, point);
			}
		})
	}

	$.extend($.fn.datagrid.methods, {
		columnMoving: function(jq){
			initCss();
			return jq.each(function(){
				moving(this);
			});
		}
	});

})(jQuery);
