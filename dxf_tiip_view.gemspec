$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "dxf_tiip_view/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "dxf_tiip_view"
  s.version     = DxfTiipView::VERSION
  s.authors     = ["Shinobu Izumi"]
  s.email       = ["stagesp1@gmail.com"]
  s.homepage    = "https://github.com/shinobushiva/dxf-tiip-view"
  s.summary     = "Summary of DxfTiipView."
  s.description = "Description of DxfTiipView."
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 4.2.9"

  s.add_development_dependency "sqlite3"
end
