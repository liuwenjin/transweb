webCpu.regComponent(
  "ParticleSystem",
  {
    script: {
      threejs: "three.min.js",
      camera: "camera_utils.js",
      hands: "hands.js"
    }
  },
  function (element, data, task) {
    // ================================================================
    // 0. 常量与配置
    // ================================================================
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    const container = element;

    // 治愈系动态样式
    container.style.backgroundColor = '#050814';
    container.style.position = container.style.position || 'relative';
    container.style.overflow = 'hidden';
    container.style.userSelect = 'none';

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes healingGlow {
        0%, 100% { box-shadow: 0 8px 32px 0 rgba(168, 85, 247, 0.25), inset 0 0 12px rgba(255, 255, 255, 0.15); }
        50% { box-shadow: 0 12px 40px 0 rgba(56, 189, 248, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.3); }
      }
      .healing-active-glow { animation: healingGlow 3s infinite ease-in-out; }
    `;
    document.head.appendChild(styleSheet);

    // ================================================================
    // 1. HUD 界面
    // ================================================================
    const hudContainer = document.createElement('div');
    Object.assign(hudContainer.style, {
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: '20',
      color: 'rgba(255, 255, 255, 0.95)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", Roboto, sans-serif',
      fontSize: '13px',
      pointerEvents: 'none',
      background: 'rgba(255, 255, 255, 0.08)',
      padding: '12px 20px',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    });

    hudContainer.innerHTML = `
      <div style="font-weight: 500; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
        <span id="hud-indicator" style="width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; display: inline-block; box-shadow: 0 0 10px #38bdf8; transition: all 0.5s;"></span>
        <span id="hud-status" style="color: rgba(255, 255, 255, 0.9); font-weight: 400;">原地行走 · 无失真骨骼流步进中...</span>
      </div>
    `;
    container.appendChild(hudContainer);

    const hudIndicatorEl = hudContainer.querySelector('#hud-indicator');
    const hudStatusEl = hudContainer.querySelector('#hud-status');

    // ================================================================
    // 2. 数学工具：矩阵 → 双四元数 (Matrix → Dual Quaternion)
    // ================================================================
    const _tempPos = new THREE.Vector3();
    const _tempQuat = new THREE.Quaternion();
    const _tempScale = new THREE.Vector3();
    const _tempMat = new THREE.Matrix4();

    function matrixToDualQuaternion(matrix) {
      _tempMat.copy(matrix);
      _tempMat.decompose(_tempPos, _tempQuat, _tempScale);

      const scaleUniform = (_tempScale.x + _tempScale.y + _tempScale.z) / 3.0;
      const scaleVariance = Math.abs(_tempScale.x - scaleUniform) + Math.abs(_tempScale.y - scaleUniform) + Math.abs(_tempScale.z - scaleUniform);
      
      if (scaleVariance > 0.01) {
        console.warn('Healing Engine: 检测到非均匀缩放，DQS 已将其归一化为均匀缩放。');
        _tempScale.set(scaleUniform, scaleUniform, scaleUniform);
        _tempMat.compose(_tempPos, _tempQuat, _tempScale);
        _tempMat.decompose(_tempPos, _tempQuat, _tempScale);
      }

      const q0 = _tempQuat.normalize();

      const tx = _tempPos.x, ty = _tempPos.y, tz = _tempPos.z;
      const qw = q0.w, qx = q0.x, qy = q0.y, qz = q0.z;

      const dq1 = new THREE.Quaternion(
        0.5 * ( tx * qw + ty * qz - tz * qy),
        0.5 * (-tx * qz + ty * qw + tz * qx),
        0.5 * ( tx * qy - ty * qx + tz * qw),
        0.5 * (-tx * qx - ty * qy - tz * qz)
      );

      return {
        dq0: new THREE.Vector4(q0.x, q0.y, q0.z, q0.w),
        dq1: new THREE.Vector4(dq1.x, dq1.y, dq1.z, dq1.w)
      };
    }

    // ================================================================
    // 3. 程序化原地行走骨骼动画（修复矩阵合成顺序与父子级挂载）
    // ================================================================
    const WALK_BONE_COUNT = 5;
    const walkBoneMatrices = Array.from({ length: WALK_BONE_COUNT }, () => new THREE.Matrix4());
    const _matRot = new THREE.Matrix4();

    function generateWalkingBones(time) {
      const walkSpeed = 3.5;
      const phase = time * walkSpeed;

      // 0. 根节点/骨盆：上下浮动 + 侧向倾斜
      const hipY = Math.abs(Math.sin(phase)) * 0.25 - 0.12;
      const hipTilt = Math.sin(phase) * 0.05;
      walkBoneMatrices[0].makeRotationZ(hipTilt);
      walkBoneMatrices[0].setPosition(0, hipY, 0);

      // 1. 左腿 / 2. 右腿：交替前后摆动
      const leftLegAngle = Math.sin(phase) * 0.45;
      const rightLegAngle = -Math.sin(phase) * 0.45;

      // 平移到关节挂载点 [-0.8, -0.5, 0]，再执行摆动旋转
      walkBoneMatrices[1].makeTranslation(-0.8, -0.5 + hipY, 0).multiply(_matRot.makeRotationX(leftLegAngle));
      walkBoneMatrices[2].makeTranslation(0.8, -0.5 + hipY, 0).multiply(_matRot.makeRotationX(rightLegAngle));

      // 3. 左臂 / 4. 右臂：与腿部反向协调摆动
      const leftArmAngle = -Math.sin(phase) * 0.35;
      const rightArmAngle = Math.sin(phase) * 0.35;

      // 平移到肩部挂载点 [±1.6, 1.2, 0]，再执行摆动旋转
      walkBoneMatrices[3].makeTranslation(-1.6, 1.2 + hipY, 0).multiply(_matRot.makeRotationX(leftArmAngle));
      walkBoneMatrices[4].makeTranslation(1.6, 1.2 + hipY, 0).multiply(_matRot.makeRotationX(rightArmAngle));

      return walkBoneMatrices;
    }

    // ================================================================
    // 4. GPU 加速 DQS 粒子系统核心
    // ================================================================
    function createParticleSystem() {
      const particleCount = isMobile ? 3000 : 7000;
      let animFrameId = null;
      let isExternalSkeletonActive = false;

      // --- Scene & Camera ---
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050814, 0.012);

      const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = isMobile ? 24 : 16;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // --- 解析外部形态生成器 ---
      let shapeInput = data && data.shapeInput ? data.shapeInput : data;
      if (typeof shapeInput === 'string') {
        shapeInput = shapeInput.replace(/```javascript|```/g, '').trim();
      }

      let generatorFn = null;
      if (typeof shapeInput === 'function') {
        generatorFn = shapeInput;
      } else if (typeof shapeInput === 'string') {
        try {
          if (shapeInput.startsWith('function') || shapeInput.includes('=>')) {
            generatorFn = new Function(`return (${shapeInput})`)();
          } else {
            generatorFn = new Function('i', 'particleCount', shapeInput);
          }
        } catch (e) {
          console.warn('Healing Engine: 形态生成器解析异常，回退到默认人体形态。', e);
        }
      }

      // 默认人体形态生成器（修复为基于骨骼节点的局部相对坐标生成）
      if (typeof generatorFn !== 'function') {
        generatorFn = (i, count) => {
          const ratio = i / count;
          let pos = [0, 0, 0];
          let skinIdx = [0, 0, 0, 0];
          let skinWeight = [1, 0, 0, 0];

          if (ratio < 0.25) {
            // 躯干 (Root - 挂载点 0, 0, 0)
            pos = [(Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 3.0, (Math.random() - 0.5) * 0.8];
            skinIdx = [0, 0, 0, 0];
            skinWeight = [1.0, 0.0, 0.0, 0.0];
          } else if (ratio < 0.5) {
            // 腿部 (Bone 1/2 - 局部原点在挂载点处)
            const isLeft = ratio < 0.375;
            const bIdx = isLeft ? 1 : 2;
            const relativeY = -Math.random() * 3.5;
            
            pos = [(Math.random() - 0.5) * 0.5, relativeY, (Math.random() - 0.5) * 0.5];

            // 胯部连接区平滑插值 (Sigmoid 软过渡)
            const distToHip = Math.min(1.0, Math.abs(relativeY) / 1.5);
            const legW = Math.sin(distToHip * Math.PI * 0.5);
            const hipW = 1.0 - legW;

            skinIdx = [bIdx, 0, 0, 0];
            skinWeight = [legW, hipW, 0.0, 0.0];
          } else {
            // 双臂 (Bone 3/4 - 局部原点在挂载点处)
            const isLeft = ratio < 0.75;
            const bIdx = isLeft ? 3 : 4;
            const relativeX = isLeft ? -Math.random() * 2.0 : Math.random() * 2.0;

            pos = [relativeX, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5];

            // 肩部连接区平滑插值
            const distToShoulder = Math.min(1.0, Math.abs(relativeX) / 1.0);
            const armW = Math.sin(distToShoulder * Math.PI * 0.5);
            const bodyW = 1.0 - armW;

            skinIdx = [bIdx, 0, 0, 0];
            skinWeight = [armW, bodyW, 0.0, 0.0];
          }

          return { position: pos, skinIndices: skinIdx, skinWeights: skinWeight };
        };
      }

      // --- Buffer 初始化 ---
      const targetPositions = new Float32Array(particleCount * 3);
      const startPositions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const skinIndices = new Float32Array(particleCount * 4);
      const skinWeights = new Float32Array(particleCount * 4);

      const palette = [
        new THREE.Color('#38bdf8'),
        new THREE.Color('#c084fc'),
        new THREE.Color('#f472b6'),
        new THREE.Color('#fde047')
      ];

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3, i4 = i * 4;
        const res = generatorFn(i, particleCount);

        let x = 0, y = 0, z = 0;
        let sIndices = [0, 0, 0, 0], sWeights = [1, 0, 0, 0];

        if (Array.isArray(res)) {
          [x = 0, y = 0, z = 0] = res;
        } else if (res && typeof res === 'object') {
          [x = 0, y = 0, z = 0] = res.position || [0, 0, 0];
          sIndices = res.skinIndices || [0, 0, 0, 0];
          sWeights = res.skinWeights || [1, 0, 0, 0];
        }

        // 目标位置（局部骨骼空间）
        targetPositions[i3] = x;
        targetPositions[i3 + 1] = y;
        targetPositions[i3 + 2] = z;

        // 起始位置（扩散态）
        const radiusFactor = 4.0 + Math.random() * 6.0;
        const spreadAngle = Math.random() * Math.PI * 2;
        startPositions[i3] = x * radiusFactor + Math.cos(spreadAngle) * 20;
        startPositions[i3 + 1] = y * radiusFactor + Math.sin(spreadAngle) * 20;
        startPositions[i3 + 2] = z * radiusFactor + (Math.random() - 0.5) * 40;

        // 骨骼索引与权重
        skinIndices[i4] = sIndices[0]; skinIndices[i4 + 1] = sIndices[1];
        skinIndices[i4 + 2] = sIndices[2]; skinIndices[i4 + 3] = sIndices[3];

        skinWeights[i4] = sWeights[0]; skinWeights[i4 + 1] = sWeights[1];
        skinWeights[i4 + 2] = sWeights[2]; skinWeights[i4 + 3] = sWeights[3];

        // 颜色混合
        const c1 = palette[Math.floor(Math.random() * palette.length)];
        const c2 = palette[Math.floor(Math.random() * palette.length)];
        const finalColor = c1.clone().lerp(c2, Math.random());

        colors[i3] = finalColor.r;
        colors[i3 + 1] = finalColor.g;
        colors[i3 + 2] = finalColor.b;
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(startPositions, 3));
      particleGeometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(targetPositions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particleGeometry.setAttribute('aSkinIndex', new THREE.BufferAttribute(skinIndices, 4));
      particleGeometry.setAttribute('aSkinWeight', new THREE.BufferAttribute(skinWeights, 4));

      // --- 双四元数骨骼 Uniform 缓存 ---
      const MAX_BONES = 16;
      const boneDQ0 = [];
      const boneDQ1 = [];
      for (let i = 0; i < MAX_BONES; i++) {
        boneDQ0.push(new THREE.Vector4(0, 0, 0, 1));
        boneDQ1.push(new THREE.Vector4(0, 0, 0, 0));
      }

      // --- 粒子发光贴图 ---
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0.0, 'rgba(255,255,255,1.0)');
      grad.addColorStop(0.2, 'rgba(255,255,255,0.8)');
      grad.addColorStop(1.0, 'rgba(255,255,255,0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      const texture = new THREE.CanvasTexture(canvas);

      // --- DQS Shader Material ---
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uExpansion: { value: 1.0 },
          uPointSize: { value: isMobile ? 1.0 * window.devicePixelRatio : 0.85 * window.devicePixelRatio },
          uTexture: { value: texture },
          uHasSkeleton: { value: 1.0 },
          uBoneDQ0: { value: boneDQ0 },
          uBoneDQ1: { value: boneDQ1 }
        },
        vertexShader: `
          uniform float uTime;
          uniform float uProgress;
          uniform float uExpansion;
          uniform float uPointSize;
          uniform float uHasSkeleton;

          uniform vec4 uBoneDQ0[16];
          uniform vec4 uBoneDQ1[16];

          attribute vec3 aTargetPosition;
          attribute vec3 color;
          attribute vec4 aSkinIndex;
          attribute vec4 aSkinWeight;

          varying vec3 vColor;
          varying float vDepth;

          vec3 transformDualQuaternion(vec3 position, vec4 dq0, vec4 dq1) {
            float len = length(dq0);
            if (len < 1e-6) return position;
            
            vec4 q0 = dq0 / len;
            vec4 q1 = dq1 / len;

            vec3 rotated = position + 2.0 * cross(q0.xyz, cross(q0.xyz, position) + q0.w * position);
            vec3 translation = 2.0 * (q0.w * q1.xyz - q1.w * q0.xyz + cross(q0.xyz, q1.xyz));

            return rotated + translation;
          }

          void main() {
            vColor = color;
            
            float easeOut = sin(uProgress * 1.5707963);
            vec3 basePos = mix(position, aTargetPosition, easeOut);

            vec3 skinnedPos = vec3(0.0);

            if (uHasSkeleton > 0.5) {
              vec4 blendDQ0 = vec4(0.0);
              vec4 blendDQ1 = vec4(0.0);

              int primaryIdx = int(aSkinIndex[0]);
              vec4 refDQ0 = uBoneDQ0[primaryIdx];

              for (int i = 0; i < 4; i++) {
                int boneIdx = int(aSkinIndex[i]);
                float weight = aSkinWeight[i];

                if (weight > 0.0 && boneIdx < 16) {
                  vec4 dq0 = uBoneDQ0[boneIdx];
                  vec4 dq1 = uBoneDQ1[boneIdx];

                  if (dot(dq0, refDQ0) < 0.0) {
                    weight = -weight;
                  }

                  blendDQ0 += dq0 * weight;
                  blendDQ1 += dq1 * weight;
                }
              }

              float blendLen = length(blendDQ0);
              if (blendLen > 1e-6) {
                blendDQ0 /= blendLen;
                blendDQ1 /= blendLen;
              }

              skinnedPos = transformDualQuaternion(basePos, blendDQ0, blendDQ1);
            } else {
              skinnedPos = basePos;
            }

            float wave = sin(uTime * 2.0 + skinnedPos.x * 0.3) * 0.05;
            vec3 finalPos = (skinnedPos + wave) * uExpansion;

            vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
            vDepth = -mvPosition.z;

            gl_PointSize = uPointSize * (120.0 / max(vDepth, 0.1));
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          varying vec3 vColor;
          void main() {
            vec4 texColor = texture2D(uTexture, gl_PointCoord);
            if (texColor.a < 0.05) discard;
            gl_FragColor = vec4(vColor * 1.4, 0.95) * texColor;
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particleSystem);

      // ================================================================
      // 渲染循环与状态管理
      // ================================================================
      let targetRotX = 0, targetRotY = 0, currentRotX = 0, currentRotY = 0;
      let targetExpansion = 1.0, currentExpansion = 1.0;
      let initProgress = 0.0, isInitializing = true;
      const clock = new THREE.Clock();

      function applyMatricesToDQS(matrices) {
        const count = Math.min(matrices.length, MAX_BONES);
        for (let i = 0; i < count; i++) {
          const mat = matrices[i] instanceof THREE.Matrix4 ? matrices[i] : new THREE.Matrix4().fromArray(matrices[i]);
          const dq = matrixToDualQuaternion(mat);
          boneDQ0[i].copy(dq.dq0);
          boneDQ1[i].copy(dq.dq1);
        }
        for (let i = count; i < MAX_BONES; i++) {
          boneDQ0[i].set(0, 0, 0, 1);
          boneDQ1[i].set(0, 0, 0, 0);
        }
      }

      function animate() {
        animFrameId = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.1);
        const elapsedTime = clock.getElapsedTime();

        particleMaterial.uniforms.uTime.value = elapsedTime;

        if (isInitializing) {
          initProgress += delta * 0.8;
          if (initProgress >= 1.0) {
            initProgress = 1.0;
            isInitializing = false;
          }
          particleMaterial.uniforms.uProgress.value = initProgress;
        }

        if (!isExternalSkeletonActive) {
          const walkBones = generateWalkingBones(elapsedTime);
          applyMatricesToDQS(walkBones);
        }

        const rotLerpFactor = 1.0 - Math.exp(-12.0 * delta);
        const expLerpFactor = 1.0 - Math.exp(-5.0 * delta);

        currentRotX += (targetRotX - currentRotX) * rotLerpFactor;
        currentRotY += (targetRotY - currentRotY) * rotLerpFactor;
        currentExpansion += (targetExpansion - currentExpansion) * expLerpFactor;

        particleMaterial.uniforms.uExpansion.value = currentExpansion;
        particleSystem.rotation.x = currentRotX;
        particleSystem.rotation.y = currentRotY + elapsedTime * 0.02;

        renderer.render(scene, camera);
      }

      function onWindowResize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }

      window.addEventListener('resize', onWindowResize);
      animate();

      return {
        setExpansion: (scale) => { targetExpansion = scale; },
        setRotation: (rx, ry) => { targetRotX = rx; targetRotY = ry; },
        updateBones: (newBoneMatrices) => {
          if (!Array.isArray(newBoneMatrices)) return;
          isExternalSkeletonActive = true;
          applyMatricesToDQS(newBoneMatrices);
        },
        getTargetRotation: () => ({ x: targetRotX, y: targetRotY }),
        getTargetExpansion: () => targetExpansion,
        destroy: () => {
          if (animFrameId) cancelAnimationFrame(animFrameId);
          window.removeEventListener('resize', onWindowResize);
          particleGeometry.dispose();
          particleMaterial.dispose();
          texture.dispose();
          renderer.dispose();
          if (renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
      };
    }

    const particleSystemInstance = createParticleSystem();

    // ================================================================
    // 5. 鼠标 / 触控交互
    // ================================================================
    let isHandTrackingActive = false;
    let handWeight = 0.0, isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };
    let mouseRotX = 0, mouseRotY = 0, mouseScale = 1.0;

    function onPointerDown(e) {
      if (handWeight > 0.5) return;
      isMouseDown = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    function onPointerMove(e) {
      if (!isMouseDown || handWeight > 0.5) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      mouseRotY += deltaX * 0.004;
      mouseRotX += deltaY * 0.004;
      mouseRotX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, mouseRotX));

      particleSystemInstance.setRotation(mouseRotX, mouseRotY);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    function onPointerUp() { isMouseDown = false; }

    function onWheel(e) {
      if (handWeight > 0.5) return;
      e.preventDefault();
      mouseScale += e.deltaY * -0.0008;
      mouseScale = Math.min(Math.max(0.6, mouseScale), 1.8);
      particleSystemInstance.setExpansion(mouseScale);
    }

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // ================================================================
    // 6. MediaPipe 手势系统
    // ================================================================
    function initMediaPipe(targetContainer) {
      const videoElement = document.createElement('video');
      videoElement.style.display = 'none';
      videoElement.playsInline = true;
      videoElement.autoplay = true;
      videoElement.muted = true;

      const cameraCanvas = document.createElement('canvas');
      const cameraCtx = cameraCanvas.getContext('2d', { alpha: true });

      Object.assign(cameraCanvas.style, {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: isMobile ? '104px' : '138px',
        aspectRatio: '4 / 3',
        objectFit: 'cover',
        borderRadius: '18px',
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.04)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.34)',
        zIndex: '20',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        transform: 'translateZ(0)',
        transition: 'transform 280ms cubic-bezier(.2,.8,.2,1), border-color 280ms ease, box-shadow 280ms ease',
        pointerEvents: 'none'
      });

      targetContainer.appendChild(videoElement);
      targetContainer.appendChild(cameraCanvas);

      const GestureMode = Object.freeze({
        NONE: 'none',
        ROTATE: 'rotate',
        PINCH_ZOOM: 'pinch',
        TWO_HAND_ZOOM: 'two-hand-zoom'
      });

      let gestureMode = GestureMode.NONE;
      let previousGestureMode = GestureMode.NONE;

      let targetHandWeight = 0;
      let lastTrackingAt = 0;
      let firstTrackingAt = 0;
      const LOST_GRACE_MS = isMobile ? 220 : 180;
      const HAND_FADE_IN_MS = 140;
      const HAND_FADE_OUT_MS = 180;

      const handControl = {
        current: { x: 0.5, y: 0.5 },
        previous: { x: 0.5, y: 0.5 },
        filteredX: 0.5,
        filteredY: 0.5,
        palmSize: 0.15,
        confidence: 0,
        pinchDistance: 0,
        twoHandDistance: 0,
        anchorX: 0.5,
        anchorY: 0.5,
        anchorRotationX: 0,
        anchorRotationY: 0,
        anchorPinch: 0,
        anchorScale: 1,
        anchorTwoHandDistance: 0,
        anchorTwoHandScale: 1,
        velocityX: 0,
        velocityY: 0,
        lastUpdateTime: performance.now()
      };

      const CONFIG = {
        rotateGain: isMobile ? 5.4 : 5.9,
        rotateMaxStep: 0.14,
        pinchStart: 0.040,
        pinchEnd: 0.072,
        pinchScaleGain: 1.15,
        twoHandMinDistance: 0.12,
        twoHandScaleGain: 1.0,
        minScale: 0.58,
        maxScale: 1.82,
        smoothingSlow: 0.075,
        smoothingFast: 0.22,
        velocitySlowThreshold: 0.0024,
        velocityFastThreshold: 0.020,
        positionDeadzone: 0.0025,
        palmReference: 0.16,
        gestureConfirmFrames: 3,
        gestureReleaseFrames: 4
      };

      let candidateMode = GestureMode.NONE;
      let candidateFrames = 0;
      let releaseFrames = 0;

      const HandMath = {
        dist: (a, b) => Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0), (a.z || 0) - (b.z || 0)),
        softVelocity: (v, max) => {
          const av = Math.abs(v);
          if (av <= max) return v;
          return Math.sign(v) * (max + Math.tanh((av - max) / max) * max);
        },
        palmCenter: (lm) => ({
          x: (lm[0].x + lm[5].x + lm[9].x + lm[13].x + lm[17].x) / 5,
          y: (lm[0].y + lm[5].y + lm[9].y + lm[13].y + lm[17].y) / 5
        }),
        palmSize: (lm) => {
          const width = Math.hypot(lm[5].x - lm[17].x, lm[5].y - lm[17].y);
          const height = Math.hypot(lm[0].x - lm[9].x, lm[0].y - lm[9].y);
          return Math.max(0.035, (width + height) * 0.5);
        }
      };

      function setGestureStatus(mode, strength = 1) {
        const statusMap = {
          [GestureMode.ROTATE]: '掌心控制 · 空间旋转',
          [GestureMode.PINCH_ZOOM]: '轻捏控制 · 聚焦缩放',
          [GestureMode.TWO_HAND_ZOOM]: '双手控制 · 自由缩放',
          [GestureMode.NONE]: '原地行走 · 无失真骨骼流步进中...'
        };

        const modeText = statusMap[mode] || statusMap[GestureMode.NONE];
        if (hudStatusEl.innerText !== modeText) {
          hudStatusEl.innerText = modeText;
        }

        if (mode !== GestureMode.NONE) {
          const activeColor = mode === GestureMode.ROTATE ? '#38bdf8' : mode === GestureMode.PINCH_ZOOM ? '#c084fc' : '#f472b6';
          hudIndicatorEl.style.background = activeColor;
          hudIndicatorEl.style.boxShadow = `0 0 ${8 + strength * 8}px ${activeColor}`;
          cameraCanvas.style.borderColor = `${activeColor}88`;
          cameraCanvas.style.boxShadow = `0 18px 42px rgba(0,0,0,0.38), 0 0 24px ${activeColor}26`;
        } else {
          hudIndicatorEl.style.background = '#38bdf8';
          hudIndicatorEl.style.boxShadow = '0 0 10px #38bdf8';
          cameraCanvas.style.borderColor = 'rgba(255,255,255,0.18)';
          cameraCanvas.style.boxShadow = '0 16px 40px rgba(0,0,0,0.34)';
        }
      }

      function requestGestureMode(nextMode) {
        if (nextMode === gestureMode) {
          candidateMode = nextMode;
          candidateFrames = 0;
          releaseFrames = 0;
          return;
        }

        if (candidateMode !== nextMode) {
          candidateMode = nextMode;
          candidateFrames = 1;
        } else {
          candidateFrames += 1;
        }

        if (nextMode === GestureMode.NONE) {
          releaseFrames += 1;
          if (releaseFrames < CONFIG.gestureReleaseFrames) return;
        } else if (candidateFrames < CONFIG.gestureConfirmFrames) {
          return;
        }

        previousGestureMode = gestureMode;
        gestureMode = nextMode;
        candidateFrames = 0;
        releaseFrames = 0;

        onGestureModeChanged(previousGestureMode, gestureMode);
      }

      function onGestureModeChanged(from, to) {
        const targetRotation = particleSystemInstance.getTargetRotation();
        const targetScale = particleSystemInstance.getTargetExpansion();

        if (to === GestureMode.ROTATE) {
          handControl.anchorX = handControl.filteredX;
          handControl.anchorY = handControl.filteredY;
          handControl.anchorRotationX = targetRotation.x;
          handControl.anchorRotationY = targetRotation.y;
        }
        if (to === GestureMode.PINCH_ZOOM) {
          handControl.anchorPinch = handControl.pinchDistance;
          handControl.anchorScale = targetScale;
        }
        if (to === GestureMode.TWO_HAND_ZOOM) {
          handControl.anchorTwoHandDistance = handControl.twoHandDistance;
          handControl.anchorTwoHandScale = targetScale;
        }

        setGestureStatus(to, 1);
        if (to === GestureMode.NONE) {
          lastTrackingAt = performance.now();
        }
      }

      function classifyGesture(lmList) {
        if (!lmList || !lmList.length) return GestureMode.NONE;

        if (lmList.length >= 2) {
          const p1 = HandMath.palmCenter(lmList[0]);
          const p2 = HandMath.palmCenter(lmList[1]);
          const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          handControl.twoHandDistance = d;
          if (d > CONFIG.twoHandMinDistance) return GestureMode.TWO_HAND_ZOOM;
        }

        const lm = lmList[0];
        const pinch = HandMath.dist(lm[4], lm[8]);
        handControl.pinchDistance = pinch;

        if (gestureMode === GestureMode.PINCH_ZOOM) {
          if (pinch < CONFIG.pinchEnd) return GestureMode.PINCH_ZOOM;
        } else {
          if (pinch < CONFIG.pinchStart) return GestureMode.PINCH_ZOOM;
        }

        return GestureMode.ROTATE;
      }

      function updateRotation(lm, dt) {
        const center = HandMath.palmCenter(lm);
        const palmSize = HandMath.palmSize(lm);
        const normalizedX = 1.0 - center.x;
        const normalizedY = center.y;

        handControl.current.x = normalizedX;
        handControl.current.y = normalizedY;

        const velocityX = (normalizedX - handControl.previous.x) / Math.max(dt, 0.001);
        const velocityY = (normalizedY - handControl.previous.y) / Math.max(dt, 0.001);

        handControl.velocityX = HandMath.softVelocity(velocityX, 0.08);
        handControl.velocityY = HandMath.softVelocity(velocityY, 0.08);

        handControl.previous.x = normalizedX;
        handControl.previous.y = normalizedY;

        const velocity = Math.hypot(handControl.velocityX, handControl.velocityY);
        const speedT = THREE.MathUtils.smoothstep(velocity, CONFIG.velocitySlowThreshold, CONFIG.velocityFastThreshold);
        const smoothing = THREE.MathUtils.lerp(CONFIG.smoothingSlow, CONFIG.smoothingFast, speedT);
        const alpha = THREE.MathUtils.clamp(smoothing * (dt * 60.0), 0.03, 0.42);

        handControl.filteredX += (normalizedX - handControl.filteredX) * alpha;
        handControl.filteredY += (normalizedY - handControl.filteredY) * alpha;

        const dx = handControl.filteredX - handControl.anchorX;
        const dy = handControl.filteredY - handControl.anchorY;

        const deadX = Math.abs(dx) < CONFIG.positionDeadzone ? 0.0 : dx;
        const deadY = Math.abs(dy) < CONFIG.positionDeadzone ? 0.0 : dy;
        const palmGain = THREE.MathUtils.clamp(CONFIG.palmReference / palmSize, 0.72, 1.18);

        const nextRotY = handControl.anchorRotationY + deadX * CONFIG.rotateGain * palmGain;
        const nextRotX = handControl.anchorRotationX - deadY * CONFIG.rotateGain * palmGain;

        const currentRotation = particleSystemInstance.getTargetRotation();
        const limitedRotX = currentRotation.x + THREE.MathUtils.clamp(nextRotX - currentRotation.x, -CONFIG.rotateMaxStep, CONFIG.rotateMaxStep);
        const limitedRotY = currentRotation.y + THREE.MathUtils.clamp(nextRotY - currentRotation.y, -CONFIG.rotateMaxStep, CONFIG.rotateMaxStep);

        particleSystemInstance.setRotation(
          THREE.MathUtils.clamp(limitedRotX, -Math.PI / 2.2, Math.PI / 2.2),
          limitedRotY
        );
      }

      function updatePinchZoom(lm) {
        const pinch = HandMath.dist(lm[4], lm[8]);
        handControl.pinchDistance = pinch;

        const anchor = Math.max(CONFIG.pinchStart * 0.8, handControl.anchorPinch);
        const ratio = pinch / anchor;

        const targetScale = handControl.anchorScale * THREE.MathUtils.clamp(
          1.0 + (ratio - 1.0) * CONFIG.pinchScaleGain,
          CONFIG.minScale / handControl.anchorScale,
          CONFIG.maxScale / handControl.anchorScale
        );

        const smoothedScale = THREE.MathUtils.lerp(particleSystemInstance.getTargetExpansion(), targetScale, 0.22);
        particleSystemInstance.setExpansion(THREE.MathUtils.clamp(smoothedScale, CONFIG.minScale, CONFIG.maxScale));
      }

      function updateTwoHandZoom(lmList) {
        if (lmList.length < 2) return;
        const p1 = HandMath.palmCenter(lmList[0]);
        const p2 = HandMath.palmCenter(lmList[1]);
        const distance = Math.max(0.06, Math.hypot(p1.x - p2.x, p1.y - p2.y));

        handControl.twoHandDistance = distance;
        const anchor = Math.max(0.08, handControl.anchorTwoHandDistance);
        const ratio = distance / anchor;

        const targetScale = THREE.MathUtils.clamp(
          handControl.anchorTwoHandScale * Math.pow(ratio, CONFIG.twoHandScaleGain),
          CONFIG.minScale,
          CONFIG.maxScale
        );

        particleSystemInstance.setExpansion(THREE.MathUtils.lerp(particleSystemInstance.getTargetExpansion(), targetScale, 0.18));
      }

      if (typeof Hands === 'undefined') {
        hudStatusEl.innerText = '触控模式 · 无失真原地行走中';
        hudIndicatorEl.style.background = '#38bdf8';
        return null;
      }

      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.72,
        minTrackingConfidence: 0.72
      });

      hands.onResults((results) => {
        const now = performance.now();
        const dt = Math.min(0.05, Math.max(0.008, (now - handControl.lastUpdateTime) / 1000.0));
        handControl.lastUpdateTime = now;

        if (cameraCanvas.width !== videoElement.videoWidth && videoElement.videoWidth > 0) {
          cameraCanvas.width = videoElement.videoWidth;
          cameraCanvas.height = videoElement.videoHeight;
        }

        cameraCtx.save();
        cameraCtx.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
        cameraCtx.translate(cameraCanvas.width, 0);
        cameraCtx.scale(-1, 1);

        if (results.image) {
          cameraCtx.globalAlpha = 0.90;
          cameraCtx.drawImage(results.image, 0, 0, cameraCanvas.width, cameraCanvas.height);
          cameraCtx.globalAlpha = 1.0;
        }

        const landmarksList = results.multiHandLandmarks || [];

        if (landmarksList.length > 0) {
          if (!firstTrackingAt) firstTrackingAt = now;
          lastTrackingAt = now;
          targetHandWeight = 1;

          if (!isHandTrackingActive) {
            isHandTrackingActive = true;
            cameraCanvas.classList.add('healing-active-glow');
          }

          handWeight += (targetHandWeight - handWeight) * Math.min(1.0, dt * (1000.0 / HAND_FADE_IN_MS));

          const ordered = landmarksList.slice().sort((a, b) => HandMath.palmSize(b) - HandMath.palmSize(a));
          const primaryHand = ordered[0];

          handControl.palmSize = HandMath.palmSize(primaryHand);
          handControl.confidence = THREE.MathUtils.clamp(handControl.palmSize / 0.22, 0.55, 1.0);

          const nextMode = classifyGesture(ordered);
          requestGestureMode(nextMode);

          if (gestureMode === GestureMode.ROTATE) {
            updateRotation(primaryHand, dt);
            setGestureStatus(GestureMode.ROTATE, handControl.confidence);
          } else if (gestureMode === GestureMode.PINCH_ZOOM) {
            updatePinchZoom(primaryHand);
            setGestureStatus(GestureMode.PINCH_ZOOM, handControl.confidence);
          } else if (gestureMode === GestureMode.TWO_HAND_ZOOM) {
            updateTwoHandZoom(ordered);
            setGestureStatus(GestureMode.TWO_HAND_ZOOM, handControl.confidence);
          }

          for (const landmarks of landmarksList) {
            drawStylizedHand(cameraCtx, landmarks, gestureMode);
          }

          const finalRotX = THREE.MathUtils.lerp(mouseRotX, particleSystemInstance.getTargetRotation().x, handWeight);
          const finalRotY = THREE.MathUtils.lerp(mouseRotY, particleSystemInstance.getTargetRotation().y, handWeight);
          const finalScale = THREE.MathUtils.lerp(mouseScale, particleSystemInstance.getTargetExpansion(), handWeight);

          particleSystemInstance.setRotation(finalRotX, finalRotY);
          particleSystemInstance.setExpansion(finalScale);
        } else {
          const lostDuration = now - lastTrackingAt;
          if (lostDuration <= LOST_GRACE_MS) {
            handWeight = Math.max(handWeight, 0.72);
          } else {
            targetHandWeight = 0;
            handWeight += (targetHandWeight - handWeight) * Math.min(1.0, dt * (1000.0 / HAND_FADE_OUT_MS));

            if (handWeight < 0.035) {
              handWeight = 0.0;
              if (isHandTrackingActive) {
                isHandTrackingActive = false;
                cameraCanvas.classList.remove('healing-active-glow');
                setGestureStatus(GestureMode.NONE);
              }

              const rotation = particleSystemInstance.getTargetRotation();
              mouseRotX = rotation.x;
              mouseRotY = rotation.y;
              mouseScale = particleSystemInstance.getTargetExpansion();

              handControl.previous.x = handControl.filteredX;
              handControl.previous.y = handControl.filteredY;
              gestureMode = GestureMode.NONE;
              candidateMode = GestureMode.NONE;
              candidateFrames = 0;
              releaseFrames = 0;
            }
          }
        }

        cameraCtx.restore();
      });

      let cameraUtils = null;
      let activeStream = null;

      if (typeof Camera !== 'undefined') {
        cameraUtils = new Camera(videoElement, {
          onFrame: async () => {
            if (videoElement.readyState >= 2) {
              await hands.send({ image: videoElement });
            }
          },
          facingMode: 'user',
          width: isMobile ? 480 : 640,
          height: isMobile ? 360 : 480
        });

        cameraUtils.start().then(() => {
          if (videoElement.srcObject) {
            activeStream = videoElement.srcObject;
          }
        }).catch(() => {
          hudStatusEl.innerText = '触控模式 · 无失真原地行走中';
        });
      }

      return {
        destroy: () => {
          try {
            if (cameraUtils && typeof cameraUtils.stop === 'function') {
              cameraUtils.stop();
            }
            if (activeStream) {
              activeStream.getTracks().forEach(track => track.stop());
            }
            hands.close();
            if (videoElement.parentNode) targetContainer.removeChild(videoElement);
            if (cameraCanvas.parentNode) targetContainer.removeChild(cameraCanvas);
          } catch (e) { /* ignore */ }
        }
      };
    }

    function drawStylizedHand(ctx, landmarks, activeMode) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17]
      ];

      ctx.save();
      ctx.lineWidth = Math.max(1.2, width / 420.0);
      ctx.strokeStyle = 'rgba(255,255,255,0.24)';
      ctx.beginPath();

      for (const [a, b] of connections) {
        ctx.moveTo(landmarks[a].x * width, landmarks[a].y * height);
        ctx.lineTo(landmarks[b].x * width, landmarks[b].y * height);
      }
      ctx.stroke();

      for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];
        let r = 1.6;
        let alpha = 0.62;

        if (i === 0 || i === 9) { r = 3.4; alpha = 0.95; }
        if (activeMode === 'pinch' && (i === 4 || i === 8)) { r = 4.4; alpha = 1.0; }

        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(lm.x * width, lm.y * height, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (activeMode === 'pinch') {
        const thumb = landmarks[4];
        const index = landmarks[8];
        const x1 = thumb.x * width;
        const y1 = thumb.y * height;
        const x2 = index.x * width;
        const y2 = index.y * height;

        ctx.strokeStyle = 'rgba(192,132,252,0.88)';
        ctx.lineWidth = Math.max(1.8, width / 300.0);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(192,132,252,0.16)';
        ctx.beginPath();
        ctx.arc((x1 + x2) * 0.5, (y1 + y2) * 0.5, Math.max(8, width / 28.0), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    const mediaPipeInstance = initMediaPipe(container);

    // ================================================================
    // 7. 统一 API 与资源销毁
    // ================================================================
    return {
      updateBones: (newBoneMatrices) => {
        if (particleSystemInstance) particleSystemInstance.updateBones(newBoneMatrices);
      },
      destroy: () => {
        container.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('wheel', onWheel);

        if (particleSystemInstance) particleSystemInstance.destroy();
        if (mediaPipeInstance) mediaPipeInstance.destroy();
        if (hudContainer.parentNode) hudContainer.parentNode.removeChild(hudContainer);
        if (styleSheet.parentNode) styleSheet.parentNode.removeChild(styleSheet);
      }
    };
  }
);