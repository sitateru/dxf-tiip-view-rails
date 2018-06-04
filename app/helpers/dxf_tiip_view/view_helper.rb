module DxfTiipView
    module ViewHelper
        def dxf_tiip(selector, font_file_path, parent='')
           
            # p DxfTiipView::Engine.mounted_path.spec.right.left
            # engine_root =  '/dxf_tiip_view' #Engine.root.to_path.sub(Rails.root.to_path, '')
            
            engine_root = '/'+DxfTiipView::Engine.mounted_path.spec.right.left
            # p engine_root
            
            render partial: 'dxf_tiip_view/make_viewable', locals: { selector: selector, font_file_path: font_file_path, engine_root: engine_root, parent: parent }
        end
    end
end