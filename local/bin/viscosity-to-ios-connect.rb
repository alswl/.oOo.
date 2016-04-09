# from: https://gist.github.com/iMerica/dfb1be6e2f664c716756
Dir.glob("#{ENV['HOME']}/Library/Application Support/Viscosity/OpenVPN/*/config.conf").each do |file|
  certificate_files = ['ca', 'cert', 'key', 'tls-auth']
  config_dir        = File.dirname(file)
  connection_name   = nil
  new_config        = []

  File.read(file).lines.each do |line|
    line.strip!

    if line.start_with?('#viscosity name')
      connection_name = line.match(/^#viscosity name (.*)/)[1]
      next
    end

    next if line.start_with?('#')
    (key, value) = line.split(/\s+/, 2)

    if certificate_files.include?(key)
      # Special case for tls-auth which is "key direction"
      if key == 'tls-auth'
        # add direction to config
        (value, direction) = value.split(/\s+/)
        new_config << "key-direction #{direction}" unless direction.nil?
      end

      certificate = File.read("#{config_dir}/#{value}")
      new_config  << "<#{key}>"
      new_config  << certificate
      new_config  << "</#{key}>"
      next
    end
    new_config << line
  end
  raise "Unable to find connection name in #{file}. Aborting." if connection_name.nil?
  new_config.unshift("# OpenVPN Config for #{connection_name}")
  out_file = "#{connection_name}.ovpn"
  File.open(out_file, 'w') { |f| f.write(new_config.join("\n") + "\n") }
  puts "wrote #{out_file}"
end
