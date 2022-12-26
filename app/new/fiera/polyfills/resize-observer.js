/**
 * Minified by jsDelivr using UglifyJS v3.4.4.
 * Original file: /npm/resize-observer-polyfill@1.5.1/dist/ResizeObserver.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
    var r = function () {
            if ("undefined" != typeof Map) return Map;

            function r(t, n) {
                var r = -1;
                return t.some(function (t, e) {
                    return t[0] === n && (r = e, !0)
                }), r
            }

            return function () {
                function t() {
                    this.__entries__ = []
                }

                return Object.defineProperty(t.prototype, "size", {
                    get: function () {
                        return this.__entries__.length
                    }, enumerable: !0, configurable: !0
                }), t.prototype.get = function (t) {
                    var e = r(this.__entries__, t), n = this.__entries__[e];
                    return n && n[1]
                }, t.prototype.set = function (t, e) {
                    var n = r(this.__entries__, t);
                    ~n ? this.__entries__[n][1] = e : this.__entries__.push([t, e])
                }, t.prototype.delete = function (t) {
                    var e = this.__entries__, n = r(e, t);
                    ~n && e.splice(n, 1)
                }, t.prototype.has = function (t) {
                    return !!~r(this.__entries__, t)
                }, t.prototype.clear = function () {
                    this.__entries__.splice(0)
                }, t.prototype.forEach = function (t, e) {
                    void 0 === e && (e = null);
                    for (var n = 0, r = this.__entries__; n < r.length; n++) {
                        var i = r[n];
                        t.call(e, i[1], i[0])
                    }
                }, t
            }()
        }(), n = "undefined" != typeof window && "undefined" != typeof document && window.document === document,
        e = "undefined" != typeof global && global.Math === Math ? global : "undefined" != typeof self && self.Math === Math ? self : "undefined" != typeof window && window.Math === Math ? window : Function("return this")(),
        a = "function" == typeof requestAnimationFrame ? requestAnimationFrame.bind(e) : function (t) {
            return setTimeout(function () {
                return t(Date.now())
            }, 1e3 / 60)
        }, h = 2;
    var i = ["top", "right", "bottom", "left", "width", "height", "size", "weight"],
        o = "undefined" != typeof MutationObserver, s = function () {
            function t() {
                this.connected_ = !1, this.mutationEventsAdded_ = !1, this.mutationsObserver_ = null, this.observers_ = [], this.onTransitionEnd_ = this.onTransitionEnd_.bind(this), this.refresh = function (t, e) {
                    var n = !1, r = !1, i = 0;

                    function o() {
                        n && (n = !1, t()), r && c()
                    }

                    function s() {
                        a(o)
                    }

                    function c() {
                        var t = Date.now();
                        if (n) {
                            if (t - i < h) return;
                            r = !0
                        } else r = !(n = !0), setTimeout(s, e);
                        i = t
                    }

                    return c
                }(this.refresh.bind(this), 20)
            }

            return t.prototype.addObserver = function (t) {
                ~this.observers_.indexOf(t) || this.observers_.push(t), this.connected_ || this.connect_()
            }, t.prototype.removeObserver = function (t) {
                var e = this.observers_, n = e.indexOf(t);
                ~n && e.splice(n, 1), !e.length && this.connected_ && this.disconnect_()
            }, t.prototype.refresh = function () {
                this.updateObservers_() && this.refresh()
            }, t.prototype.updateObservers_ = function () {
                var t = this.observers_.filter(function (t) {
                    return t.gatherActive(), t.hasActive()
                });
                return t.forEach(function (t) {
                    return t.broadcastActive()
                }), 0 < t.length
            }, t.prototype.connect_ = function () {
                n && !this.connected_ && (document.addEventListener("transitionend", this.onTransitionEnd_), window.addEventListener("resize", this.refresh), o ? (this.mutationsObserver_ = new MutationObserver(this.refresh), this.mutationsObserver_.observe(document, {
                    attributes: !0,
                    childList: !0,
                    characterData: !0,
                    subtree: !0
                })) : (document.addEventListener("DOMSubtreeModified", this.refresh), this.mutationEventsAdded_ = !0), this.connected_ = !0)
            }, t.prototype.disconnect_ = function () {
                n && this.connected_ && (document.removeEventListener("transitionend", this.onTransitionEnd_), window.removeEventListener("resize", this.refresh), this.mutationsObserver_ && this.mutationsObserver_.disconnect(), this.mutationEventsAdded_ && document.removeEventListener("DOMSubtreeModified", this.refresh), this.mutationsObserver_ = null, this.mutationEventsAdded_ = !1, this.connected_ = !1)
            }, t.prototype.onTransitionEnd_ = function (t) {
                var e = t.propertyName, n = void 0 === e ? "" : e;
                i.some(function (t) {
                    return !!~n.indexOf(t)
                }) && this.refresh()
            }, t.getInstance = function () {
                return this.instance_ || (this.instance_ = new t), this.instance_
            }, t.instance_ = null, t
        }(), u = function (t, e) {
            for (var n = 0, r = Object.keys(e); n < r.length; n++) {
                var i = r[n];
                Object.defineProperty(t, i, {value: e[i], enumerable: !1, writable: !1, configurable: !0})
            }
            return t
        }, d = function (t) {
            return t && t.ownerDocument && t.ownerDocument.defaultView || e
        }, p = b(0, 0, 0, 0);

    function v(t) {
        return parseFloat(t) || 0
    }

    function l(n) {
        for (var t = [], e = 1; e < arguments.length; e++) t[e - 1] = arguments[e];
        return t.reduce(function (t, e) {
            return t + v(n["border-" + e + "-width"])
        }, 0)
    }

    function c(t) {
        var e = t.clientWidth, n = t.clientHeight;
        if (!e && !n) return p;
        var r, i = d(t).getComputedStyle(t), o = function (t) {
            for (var e = {}, n = 0, r = ["top", "right", "bottom", "left"]; n < r.length; n++) {
                var i = r[n], o = t["padding-" + i];
                e[i] = v(o)
            }
            return e
        }(i), s = o.left + o.right, c = o.top + o.bottom, a = v(i.width), h = v(i.height);
        if ("border-box" === i.boxSizing && (Math.round(a + s) !== e && (a -= l(i, "left", "right") + s), Math.round(h + c) !== n && (h -= l(i, "top", "bottom") + c)), (r = t) !== d(r).document.documentElement) {
            var u = Math.round(a + s) - e, f = Math.round(h + c) - n;
            1 !== Math.abs(u) && (a -= u), 1 !== Math.abs(f) && (h -= f)
        }
        return b(o.left, o.top, a, h)
    }

    var f = "undefined" != typeof SVGGraphicsElement ? function (t) {
        return t instanceof d(t).SVGGraphicsElement
    } : function (t) {
        return t instanceof d(t).SVGElement && "function" == typeof t.getBBox
    };

    function _(t) {
        return n ? f(t) ? b(0, 0, (e = t.getBBox()).width, e.height) : c(t) : p;
        var e
    }

    function b(t, e, n, r) {
        return {x: t, y: e, width: n, height: r}
    }

    var m = function () {
        function t(t) {
            this.broadcastWidth = 0, this.broadcastHeight = 0, this.contentRect_ = b(0, 0, 0, 0), this.target = t
        }

        return t.prototype.isActive = function () {
            var t = _(this.target);
            return (this.contentRect_ = t).width !== this.broadcastWidth || t.height !== this.broadcastHeight
        }, t.prototype.broadcastRect = function () {
            var t = this.contentRect_;
            return this.broadcastWidth = t.width, this.broadcastHeight = t.height, t
        }, t
    }(),
        y = function (t, e) {
        var n, r, i, o, s, c, a,
            h = (r = (n = e).x, i = n.y, o = n.width, s = n.height, c = "undefined" != typeof DOMRectReadOnly ? DOMRectReadOnly : Object, a = Object.create(c.prototype), u(a, {
                x: r,
                y: i,
                width: o,
                height: s,
                top: i,
                right: r + o,
                bottom: s + i,
                left: r
            }), a);
        u(this, {target: t, contentRect: h})
    },
        g = function () {
        function t(t, e, n) {
            if (this.activeObservations_ = [], this.observations_ = new r, "function" != typeof t) throw new TypeError("The callback provided as parameter 1 is not a function.");
            this.callback_ = t, this.controller_ = e, this.callbackCtx_ = n
        }

        return t.prototype.observe = function (t) {
            if (!arguments.length) throw new TypeError("1 argument required, but only 0 present.");
            if ("undefined" != typeof Element && Element instanceof Object) {
                if (!(t instanceof d(t).Element)) throw new TypeError('parameter 1 is not of type "Element".');
                var e = this.observations_;
                e.has(t) || (e.set(t, new m(t)), this.controller_.addObserver(this), this.controller_.refresh())
            }
        }, t.prototype.unobserve = function (t) {
            if (!arguments.length) throw new TypeError("1 argument required, but only 0 present.");
            if ("undefined" != typeof Element && Element instanceof Object) {
                if (!(t instanceof d(t).Element)) throw new TypeError('parameter 1 is not of type "Element".');
                var e = this.observations_;
                e.has(t) && (e.delete(t), e.size || this.controller_.removeObserver(this))
            }
        }, t.prototype.disconnect = function () {
            this.clearActive(), this.observations_.clear(), this.controller_.removeObserver(this)
        }, t.prototype.gatherActive = function () {
            var e = this;
            this.clearActive(), this.observations_.forEach(function (t) {
                t.isActive() && e.activeObservations_.push(t)
            })
        }, t.prototype.broadcastActive = function () {
            if (this.hasActive()) {
                var t = this.callbackCtx_, e = this.activeObservations_.map(function (t) {
                    return new y(t.target, t.broadcastRect())
                });
                this.callback_.call(t, e, t), this.clearActive()
            }
        }, t.prototype.clearActive = function () {
            this.activeObservations_.splice(0)
        }, t.prototype.hasActive = function () {
            return 0 < this.activeObservations_.length
        }, t
    }(),
        w = "undefined" != typeof WeakMap ? new WeakMap : new r,
        t = function t(e) {
        if (!(this instanceof t)) throw new TypeError("Cannot call a class as a function.");
        if (!arguments.length) throw new TypeError("1 argument required, but only 0 present.");
        var n = s.getInstance(), r = new g(e, n, this);
        w.set(this, r)
    };
    let result = ["observe", "unobserve", "disconnect"].forEach(function (e) {
        t.prototype[e] = function () {
            var t;
            return (t = w.get(this))[e].apply(t, arguments)
        }
    })

export default t;
