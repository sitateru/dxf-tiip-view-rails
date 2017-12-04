module DxfTiipView
    module ViewHelper
        def dxf_tiip(selector, font_file_path)
            p font_file_path
            engine_root =  Engine.root.to_path.sub(Rails.root.to_path, '')
            render partial: 'dxf_tiip_view/make_viewable', locals: { selector: selector, font_file_path: font_file_path, engine_root: engine_root }
        end
    end
end