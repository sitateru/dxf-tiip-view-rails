require 'net/http'
require 'tempfile'
require 'uri'

require 'open-uri'

module DxfTiipView
  class DxfController < ApplicationController
    
    def view
    end
    
    def download
      
      p "------"
      url = params[:url]
      url = URI.unescape(url).gsub('&amp;', '&')
      p url
      
      uri = URI.parse(url)
      filename = File.basename(uri.path)
      
      tmp = Tempfile.new('dxf_tiip_view', 'tmp')
      tmp.tap do |file|
        file.binmode
        file.write(open(url).read)
        file.close
      end
      stat = File::stat(tmp.path)
      
      send_file(tmp.path, type: 'application/octet-stream', disposition: "attachment", filename: filename, length: stat.size )
      
      file_body = Class.new do #FileBodyをコピぺ
          attr_reader :to_path

          def initialize(path)
            @to_path = path
          end

          # Stream the file's contents if Rack::Sendfile isn't present.
          def each
            File.open(to_path, 'rb') do |file|
              while chunk = file.read(16384)
                yield chunk
              end
            end
          end

          # closeを追加
          def close
            FileUtils.rm_rf @to_path
          end
        end
        self.response_body = file_body.new(tmp.path) #response_bodyを上書き
  
    end
  end
end
