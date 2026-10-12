webCpu.regComponent(
  "3Dmol",
  {
    script: "3Dmol-min.js",
  },
  function (element, config, task) {

    let viewer = $3Dmol.createViewer(element, { backgroundColor: 'white' });

    // 2. 加载分子模型数据
    let model = viewer.addModel(config.molecule.data, config.molecule.format);

    // 3. 应用样式配置
    if (config.styles && config.styles.length > 0) {
      config.styles.forEach(item => {
        viewer.setStyle(item.select || {}, item.style);
      });
    } else {
      // 默认样式
      viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
    }

    // 4. 添加标签 Label
    if (config.labels) {
      config.labels.forEach(lbl => {
        viewer.addLabel(lbl.text, lbl.options || {}, lbl.position);
      });
    }

    // 5. 添加形状 Shape (如氢键/测量线)
    if (config.shapes) {
      config.shapes.forEach(shp => {
        if (shp.type === 'cylinder') {
          viewer.addCylinder({
            start: shp.start,
            end: shp.end,
            radius: shp.radius || 0.1,
            color: shp.color || 'yellow',
            dashed: true
          });
        }
      });
    }

    // 6. 视角与渲染刷新
    if (config.view && config.view.zoom) {
      viewer.zoom(config.view.zoom);
    } else {
      viewer.zoomTo(); // 自动对焦中央
    }

    viewer.render();

  }
);
