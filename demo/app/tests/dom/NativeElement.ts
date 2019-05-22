import { createElement, NativeElementNode } from 'svelte-native/dom'
import NativeElementHarness from './NativeElementHarness.svelte'
import MountParent from './MountParent.svelte'
import MountChild from './MountChild.svelte'
import { LayoutBase, ViewBase } from 'tns-core-modules/ui/layouts/layout-base'

describe('NativeElementNode', function () {
    let test_subject: NativeElementNode;
    before(async function () {
        let el = createElement('fragment');
        let harness = new NativeElementHarness({ target: el });
        test_subject = (harness as any).test_subject
        assert.isNotNull(test_subject)
    })

    it('sets known properties onto its nativeView', function () {
        assert.equal((test_subject.nativeView as any).textWrap, true);
    })

    it('sets text node children as text property of nativeView', function () {
        assert.equal((test_subject.nativeView as any).text, 'Text Content');
    })

    it('sets class property on nativeView', function () {
        assert.isTrue((test_subject.nativeView as any).cssClasses.has("testlabel"));
    })

    it('supports class directive', function () {
        assert.isTrue((test_subject.nativeView as any).cssClasses.has('boolclass'));
        assert.isFalse((test_subject.nativeView as any).cssClasses.has('boolclassf'))
    })


    it('sets style properties on native view', function () {
        assert.equal((test_subject.nativeView as any).style.color.name, 'red');
        assert.equal((test_subject.nativeView as any).color.name, 'red');
    })
});

describe('NativeElementNode Mounting', function () {
    let mount_parent: { $destroy: any, stack: NativeElementNode, first: NativeElementNode, last: NativeElementNode } = null;
    beforeEach(async function () {
        let el = createElement('fragment');
        let harness = new MountParent({ target: el });
        mount_parent = (harness as any);
    })

    afterEach(function () {
        mount_parent.$destroy();
    });

    function assertChildrenMatch(parent: LayoutBase, expected: ViewBase[]) {
        assert.equal(parent.getChildrenCount(), expected.length);
        for (var i = 0; i < parent.getChildrenCount(); i++) {
            assert.equal(parent.getChildAt(i), expected[i]);
        }
    }


    it('can mount child element at the end', function () {
        let mount_child: { $destroy: any, childA: NativeElementNode, childB: NativeElementNode } = new MountChild({ target: mount_parent.stack }) as any;
        try {
            assertChildrenMatch(mount_parent.stack.nativeView as LayoutBase, [
                mount_parent.first.nativeView,
                mount_parent.last.nativeView,
                mount_child.childA.nativeView,
                mount_child.childB.nativeView
            ])
        } finally {
            mount_child.$destroy()
        }

    })

    it('can mount child element before an anchor', function () {
        let mount_child: { $destroy: any, childA: NativeElementNode, childB: NativeElementNode } = new MountChild({ target: mount_parent.stack, anchor: mount_parent.last }) as any;
        try {
            assertChildrenMatch(mount_parent.stack.nativeView as LayoutBase, [
                mount_parent.first.nativeView,

                mount_child.childA.nativeView,
                mount_child.childB.nativeView,

                mount_parent.last.nativeView,
            ])
        } finally {
            mount_child.$destroy()
        }

    })

})
